import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Input schema for the LinkedIn automation workflow
const linkedinWorkflowInputSchema = z.object({
  linkedinUrl: z.string().url().describe('LinkedIn URL to navigate to (e.g., https://www.linkedin.com/messaging/)'),
  replyMode: z.enum(['auto', 'draft', 'review']).default('review').describe('How to handle replies: auto (send immediately), draft (save as draft), review (show for approval)'),
  maxMessages: z.number().min(1).max(50).default(20).describe('Maximum number of messages to process (increased to handle all messages)'),
  customInstructions: z.string().optional().describe('Additional instructions for message replies'),
  credentials: z.object({
    email: z.string().email().describe('LinkedIn email address'),
    password: z.string().describe('LinkedIn password'),
  }).optional().describe('LinkedIn login credentials'),
  processAllMessages: z.boolean().default(true).describe('Whether to process all available messages or limit to maxMessages'),
});

// Step 1: Navigate to LinkedIn and analyze messages
const navigateToLinkedInStep = createStep({
  id: 'navigate-to-linkedin',
  inputSchema: linkedinWorkflowInputSchema,
  outputSchema: z.object({
    messages: z.array(z.object({
      sender: z.string(),
      content: z.string(),
      timestamp: z.string(),
      messageId: z.string(),
      priority: z.enum(['high', 'medium', 'low']).default('medium'),
      messageType: z.enum(['connection_request', 'business_inquiry', 'follow_up', 'general']).default('general'),
    })),
    navigationSuccess: z.boolean(),
    authenticationRequired: z.boolean(),
    errorMessage: z.string().optional(),
    totalMessagesFound: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('linkedinAgent');
    if (!agent) {
      throw new Error('LinkedIn agent not found');
    }

    const authSection = inputData.credentials ? `
      Authentication Credentials:
      Email: ${inputData.credentials.email}
      Password: ${inputData.credentials.password}
      
      Please log in using these credentials before accessing messages.
    ` : '';

    const messageLimit = inputData.processAllMessages ? 'ALL available messages' : `up to ${inputData.maxMessages} messages`;
    
    const prompt = `
      LINKEDIN WORKFLOW - STEP BY STEP EXECUTION:
      ${authSection}
      
      STEP 1: NAVIGATE AND LOGIN TO LINKEDIN
      - Open a new browser page and navigate directly to https://www.linkedin.com
      - DO NOT open a blank page - always navigate to the LinkedIn URL first
      ${inputData.credentials ? '- Attempt login with provided credentials' : '- Check if already authenticated'}
      - If login fails or gets stuck (2FA, captcha, etc.):
        * IMMEDIATELY stop the process
        * Ask user to manually complete login
        * Provide clear instructions: "Please manually log into LinkedIn and handle any security challenges"
        * Wait for user confirmation before proceeding
      - Do NOT proceed to Step 2 until login is successful
      
      STEP 2: GET USER PROFILE INFORMATION
      - Once logged in, extract the current user's profile information (name, headline, etc.)
      - This helps identify who the user is instead of using demo data
      
      STEP 3: OPEN MESSAGES AND EXTRACT REAL DATA
      - Navigate to LinkedIn Messages (https://www.linkedin.com/messaging/)
      - Wait for the page to load completely
      - Read ${messageLimit} from the inbox
      - For EACH message, extract:
        * Sender name and profile info
        * Complete message content
        * Timestamp
        * Message type (connection request, business inquiry, follow_up, general)
        * Priority level (high, medium, low)
      - Format the output as:
        From: [Sender Name]
        Message: [Message Content]
        Type: [connection_request/business_inquiry/follow_up/general]
        Priority: [high/medium/low]
      - Return ALL message data for draft reply generation
      
      CRITICAL REQUIREMENTS:
      - Always start by navigating to https://www.linkedin.com
      - If stuck at login, ask user for manual assistance
      - Process ALL available messages
      - Extract real data, not demo data
      - Use Playwright MCP tools for browser interactions
      - Handle pagination if needed
      - Be respectful of rate limits
      - Provide clear error messages if any step fails
    `;

    try {
      const response = await agent.generate(prompt, {
        maxSteps: 15,
        resourceId: 'linkedin-automation',
        threadId: `linkedin-session-${Date.now()}`,
      });

      // Check if authentication was successful
      const responseText = response.text.toLowerCase();
      const authFailed = responseText.includes('authentication failed') || 
                        responseText.includes('login failed') || 
                        responseText.includes('2fa required') ||
                        responseText.includes('captcha') ||
                        responseText.includes('stuck');

      if (authFailed) {
        console.log('🔐 Authentication issue detected - prompting user for manual intervention');
        return {
          messages: [],
          navigationSuccess: false,
          authenticationRequired: true,
          errorMessage: 'Authentication failed. Please manually log into LinkedIn and handle any 2FA or security challenges, then try again.',
          totalMessagesFound: 0,
        };
      }

      // Parse the response to extract actual message data from LinkedIn
      // Extract messages from the agent's response
      let messages = [];
      
      try {
        // Try to parse structured data from the agent response
        const responseLines = response.text.split('\n');
        let currentMessage = null;
        
        for (const line of responseLines) {
          const trimmedLine = line.trim();
          
          // Look for message patterns in the response
          if (trimmedLine.includes('From:') || trimmedLine.includes('Sender:')) {
            if (currentMessage) {
              messages.push(currentMessage);
            }
            currentMessage = {
              sender: trimmedLine.split(':')[1]?.trim() || 'Unknown Sender',
              content: '',
              timestamp: new Date().toISOString(),
              messageId: `msg-${messages.length + 1}`,
              priority: 'medium' as const,
              messageType: 'general' as const,
            };
          } else if (trimmedLine.includes('Message:') || trimmedLine.includes('Content:')) {
            if (currentMessage) {
              currentMessage.content = trimmedLine.split(':')[1]?.trim() || '';
            }
          } else if (trimmedLine.includes('Type:')) {
            if (currentMessage) {
              const type = trimmedLine.split(':')[1]?.trim().toLowerCase();
              if (['connection_request', 'business_inquiry', 'follow_up', 'general'].includes(type)) {
                currentMessage.messageType = type as any;
              }
            }
          } else if (trimmedLine.includes('Priority:')) {
            if (currentMessage) {
              const priority = trimmedLine.split(':')[1]?.trim().toLowerCase();
              if (['high', 'medium', 'low'].includes(priority)) {
                currentMessage.priority = priority as any;
              }
            }
          }
        }
        
        // Add the last message if exists
        if (currentMessage) {
          messages.push(currentMessage);
        }
        
        // If no messages were parsed from response, create a fallback message indicating the issue
        if (messages.length === 0) {
          console.log('No messages found in agent response, creating fallback message');
          messages = [{
            sender: "System",
            content: "No messages could be extracted from LinkedIn. This might be due to authentication issues or empty inbox.",
            timestamp: new Date().toISOString(),
            messageId: "system-msg-1",
            priority: 'high' as const,
            messageType: 'general' as const,
          }];
        }
      } catch (parseError) {
        console.error('Error parsing messages from response:', parseError);
        // Fallback to a system message
        messages = [{
          sender: "System",
          content: "Error occurred while extracting messages from LinkedIn. Please check your connection and authentication.",
          timestamp: new Date().toISOString(),
          messageId: "error-msg-1",
          priority: 'high' as const,
          messageType: 'general' as const,
        }];
      }

      // Filter messages based on processAllMessages setting
      const filteredMessages = inputData.processAllMessages ? 
        messages : 
        messages.slice(0, inputData.maxMessages);

      return {
        messages: filteredMessages,
        navigationSuccess: true,
        authenticationRequired: false,
        totalMessagesFound: messages.length,
      };
    } catch (error) {
      console.error('Navigation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        messages: [],
        navigationSuccess: false,
        authenticationRequired: errorMessage.includes('auth') || errorMessage.includes('login'),
        errorMessage: `Navigation failed: ${errorMessage}. Please check your LinkedIn credentials and try again.`,
        totalMessagesFound: 0,
      };
    }
  },
});

// Step 2: Generate contextual replies for each message
const generateRepliesStep = createStep({
  id: 'generate-replies',
  inputSchema: z.object({
    messages: z.array(z.object({
      sender: z.string(),
      content: z.string(),
      timestamp: z.string(),
      messageId: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      messageType: z.enum(['connection_request', 'business_inquiry', 'follow_up', 'general']),
    })),
    customInstructions: z.string().optional(),
    replyMode: z.enum(['auto', 'draft', 'review']),
    totalMessagesFound: z.number(),
  }),
  outputSchema: z.object({
    replies: z.array(z.object({
      messageId: z.string(),
      sender: z.string(),
      originalMessage: z.string(),
      suggestedReply: z.string(),
      reasoning: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      messageType: z.enum(['connection_request', 'business_inquiry', 'follow_up', 'general']),
      timestamp: z.string(),
      keyPoints: z.array(z.string()),
    })),
    totalRepliesGenerated: z.number(),
    processingStats: z.object({
      highPriority: z.number(),
      mediumPriority: z.number(),
      lowPriority: z.number(),
      failedGenerations: z.number(),
    }),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('linkedinAgent');
    if (!agent) {
      throw new Error('LinkedIn agent not found');
    }

    const replies = [];
    
    console.log(`🔄 Processing ${inputData.messages.length} messages out of ${inputData.totalMessagesFound} total found`);
    
    // Sort messages by priority (high first) and then by timestamp (newest first)
    const sortedMessages = [...inputData.messages].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    for (const message of sortedMessages) {
      // Enhanced context-aware prompt based on message type and priority
      const messageTypeGuidance = {
        connection_request: 'This is a connection request. Acknowledge their interest, express enthusiasm for connecting, and suggest a brief introduction or next step.',
        business_inquiry: 'This is a business inquiry. Be professional and helpful, show interest, but avoid being overly promotional. Focus on understanding their needs.',
        follow_up: 'This is a follow-up message. Reference any previous interactions if applicable, maintain the conversation flow, and show appreciation.',
        general: 'This is a general message. Match their tone, be friendly and professional, and look for opportunities to deepen the connection.'
      };
      
      const priorityGuidance = {
        high: 'HIGH PRIORITY: This message requires immediate attention and a thoughtful, engaging response.',
        medium: 'MEDIUM PRIORITY: Provide a professional and courteous response.',
        low: 'LOW PRIORITY: Keep the response brief but friendly.'
      };

      const prompt = `
        CREATE DRAFT REPLY for LinkedIn message - this will be saved as a draft, not sent automatically.
        
        MESSAGE DETAILS:
        Sender: ${message.sender}
        Message: "${message.content}"
        Timestamp: ${message.timestamp}
        Message Type: ${message.messageType}
        Priority Level: ${message.priority}
        
        CONTEXT GUIDANCE:
        ${priorityGuidance[message.priority]}
        ${messageTypeGuidance[message.messageType]}
        
        ${inputData.customInstructions ? `CUSTOM INSTRUCTIONS: ${inputData.customInstructions}` : ''}
        
        DRAFT REPLY REQUIREMENTS:
        1. Create a professional draft message ready for review
        2. Provide detailed reasoning for your response approach
        3. Identify key points you're addressing from their message
        
        ENHANCED GUIDELINES FOR DRAFT CREATION:
        - Tailor response length to priority: High (100-150 words), Medium (75-125 words), Low (50-100 words)
        - Match the tone and communication style of the original message
        - Be helpful, authentic, and professional
        - Reference specific points from their message to show you read it carefully
        - Avoid generic responses - make each reply unique and personal
        - For connection requests: Express genuine interest and suggest next steps
        - For business inquiries: Show interest while maintaining professionalism
        - For follow-ups: Reference previous context and continue the conversation naturally
        - Include a clear call-to-action or next step when appropriate
        - Use their name if mentioned or reference their background if relevant
        
        Generate a thoughtful DRAFT reply that will be saved for review before sending. Focus on maintaining professional relationships and encouraging meaningful connections.
      `;

      try {
        console.log(`📝 Generating reply for ${message.sender} (${message.priority} priority, ${message.messageType})`);
        
        const response = await agent.generate(prompt, {
          maxSteps: 5,
          resourceId: 'linkedin-automation',
          threadId: `reply-generation-${message.messageId}`,
          output: z.object({
            suggestedReply: z.string(),
            reasoning: z.string(),
            keyPoints: z.array(z.string()).optional(),
          }),
        });

        if (response.object) {
          replies.push({
            messageId: message.messageId,
            sender: message.sender,
            originalMessage: message.content,
            suggestedReply: response.object.suggestedReply,
            reasoning: response.object.reasoning,
            priority: message.priority,
            messageType: message.messageType,
            timestamp: message.timestamp,
            keyPoints: response.object.keyPoints || [],
          });
          
          console.log(`✅ Reply generated for ${message.sender}`);
        } else {
          console.log(`⚠️ No response object received for ${message.sender}`);
        }
      } catch (error) {
        console.error(`❌ Failed to generate reply for message ${message.messageId} from ${message.sender}:`, error);
        
        // Add a fallback reply for failed generations
        replies.push({
          messageId: message.messageId,
          sender: message.sender,
          originalMessage: message.content,
          suggestedReply: `Thank you for your message! I appreciate you reaching out and will get back to you soon with a more detailed response.`,
          reasoning: `Fallback reply due to generation error: ${error}`,
          priority: message.priority,
          messageType: message.messageType,
          timestamp: message.timestamp,
          keyPoints: ['Acknowledgment', 'Professional courtesy'],
        });
      }
    }

    // Calculate processing statistics
    const stats = {
      highPriority: replies.filter(r => r.priority === 'high').length,
      mediumPriority: replies.filter(r => r.priority === 'medium').length,
      lowPriority: replies.filter(r => r.priority === 'low').length,
      failedGenerations: replies.filter(r => r.reasoning.includes('Fallback reply')).length,
    };
    
    console.log(`📊 Reply generation completed: ${replies.length} total replies`);
    console.log(`   High priority: ${stats.highPriority}, Medium: ${stats.mediumPriority}, Low: ${stats.lowPriority}`);
    console.log(`   Failed generations: ${stats.failedGenerations}`);

    return { 
      replies,
      totalRepliesGenerated: replies.length,
      processingStats: stats,
    };
  },
});

// Step 3: Send or save replies based on mode
const handleRepliesStep = createStep({
  id: 'handle-replies',
  inputSchema: z.object({
    replies: z.array(z.object({
      messageId: z.string(),
      sender: z.string(),
      originalMessage: z.string(),
      suggestedReply: z.string(),
      reasoning: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      messageType: z.enum(['connection_request', 'business_inquiry', 'follow_up', 'general']),
      timestamp: z.string(),
      keyPoints: z.array(z.string()),
    })),
    replyMode: z.enum(['auto', 'draft', 'review']),
    processingStats: z.object({
      highPriority: z.number(),
      mediumPriority: z.number(),
      lowPriority: z.number(),
      failedGenerations: z.number(),
    }),
  }),
  outputSchema: z.object({
    processedReplies: z.array(z.object({
      messageId: z.string(),
      status: z.enum(['sent', 'drafted', 'pending_review']),
      action: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      messageType: z.enum(['connection_request', 'business_inquiry', 'follow_up', 'general']),
      sender: z.string(),
    })),
    summary: z.string(),
    authenticationIssues: z.boolean(),
    detailedStats: z.object({
      totalProcessed: z.number(),
      sent: z.number(),
      drafted: z.number(),
      pendingReview: z.number(),
      authenticationFailures: z.number(),
    }),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('linkedinAgent');
    if (!agent) {
      throw new Error('LinkedIn agent not found');
    }

    const processedReplies = [];
    let summary = '';
    
    console.log(`🚀 Processing ${inputData.replies.length} replies in ${inputData.replyMode} mode`);
    console.log(`📊 Stats - High: ${inputData.processingStats.highPriority}, Medium: ${inputData.processingStats.mediumPriority}, Low: ${inputData.processingStats.lowPriority}`);
    
    // Process replies in priority order (high priority first)
    const sortedReplies = [...inputData.replies].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const reply of sortedReplies) {
      let status: 'sent' | 'drafted' | 'pending_review';
      let action: string;
      
      console.log(`📤 Processing ${reply.priority} priority ${reply.messageType} from ${reply.sender}`);

      switch (inputData.replyMode) {
        case 'auto':
          // In auto mode, create drafts for safety (changed from immediate sending)
          const autoDraftPrompt = `
            CRITICAL: Create a draft reply to ${reply.sender} on LinkedIn with authentication handling:
            "${reply.suggestedReply}"
            
            Message Context:
            - Priority: ${reply.priority}
            - Type: ${reply.messageType}
            - Key Points: ${reply.keyPoints.join(', ')}
            
            AUTHENTICATION HANDLING:
            - If you encounter any authentication issues, IMMEDIATELY stop and inform the user
            - If login is required, prompt user to manually authenticate
            - Do NOT proceed without proper authentication
            
            Use Playwright to:
            1. Verify you are still logged into LinkedIn
            2. Navigate to the conversation with ${reply.sender}
            3. Wait for the conversation to load completely
            4. Type the reply in the message box
            5. SAVE AS DRAFT (do not send automatically)
            6. Confirm draft was saved successfully
            
            If ANY step fails due to authentication, stop and request user intervention.
          `;
          
          try {
            const draftResponse = await agent.generate(autoDraftPrompt, {
              maxSteps: 10,
              resourceId: 'linkedin-automation',
              threadId: `auto-draft-${reply.messageId}`,
            });
            
            // Check if authentication was required
            const responseText = draftResponse.text.toLowerCase();
            if (responseText.includes('authentication') || responseText.includes('login required')) {
              status = 'pending_review';
              action = 'Authentication required - please log in manually and retry';
            } else {
              status = 'drafted';
              action = `Draft created automatically (${reply.priority} priority) - ready for review and sending`;
            }
          } catch (error) {
            status = 'pending_review';
            action = `Auto-draft failed: ${error}. Please check authentication and try again.`;
          }
          break;

        case 'draft':
          // In draft mode, save as draft without sending
          console.log(`📝 Creating draft reply for ${reply.sender}`);
          
          const draftPrompt = `
            CREATE DRAFT REPLY for LinkedIn message using Playwright automation.
            
            AUTHENTICATION CHECK:
            - Verify you are still logged into LinkedIn
            - If authentication expired, STOP and inform user
            - Ask user to manually re-authenticate if needed
            
            Draft Creation Steps:
            1. Navigate to LinkedIn Messages (https://www.linkedin.com/messaging/)
            2. Find conversation with ${reply.sender}
            3. Click on the conversation to open it
            4. Click on the message input field
            5. Type the draft reply: "${reply.suggestedReply}"
            6. SAVE AS DRAFT (do not send automatically)
            7. Confirm draft was saved successfully
            
            Draft Details:
            - To: ${reply.sender}
            - Message: ${reply.suggestedReply}
            - Priority: ${reply.priority}
            - Type: ${reply.messageType}
            
            IMPORTANT: This is a DRAFT creation only - do not send the message.
            If any step fails due to authentication, immediately stop and request user assistance.
          `;
          
          try {
            const draftResponse = await agent.generate(draftPrompt, {
              maxSteps: 8,
              resourceId: 'linkedin-draft-creation',
              threadId: `draft-reply-${reply.messageId}`,
            });
            
            const responseText = draftResponse.text.toLowerCase();
            if (responseText.includes('authentication') || responseText.includes('login required')) {
              status = 'pending_review';
              action = 'Authentication required for draft save - please log in manually';
            } else {
              status = 'drafted';
              action = `Draft reply created for ${reply.sender} - ready for review and sending`;
            }
          } catch (error) {
            status = 'pending_review';
            action = `Draft save failed: ${error}. Please check authentication.`;
          }
          break;

        case 'review':
        default:
          // In review mode, just mark for manual review
          status = 'pending_review';
          action = `Reply generated for manual review (${reply.priority} priority ${reply.messageType})`;
          break;
      }

      processedReplies.push({
        messageId: reply.messageId,
        status,
        action,
        priority: reply.priority,
        messageType: reply.messageType,
        sender: reply.sender,
      });
      
      console.log(`✅ ${reply.sender}: ${status} - ${action}`);
    }

    // Generate summary
    const sentCount = processedReplies.filter(r => r.status === 'sent').length;
    const draftedCount = processedReplies.filter(r => r.status === 'drafted').length;
    const reviewCount = processedReplies.filter(r => r.status === 'pending_review').length;

    summary = `LinkedIn automation completed: ${sentCount} sent, ${draftedCount} drafted, ${reviewCount} pending review`;

    const stats = {
      totalProcessed: processedReplies.length,
      sent: processedReplies.filter(r => r.status === 'sent').length,
      drafted: processedReplies.filter(r => r.status === 'drafted').length,
      pendingReview: processedReplies.filter(r => r.status === 'pending_review').length,
      authenticationFailures: processedReplies.filter(r => r.action.includes('authentication')).length,
    };

    return {
      processedReplies,
      summary,
      authenticationIssues: stats.authenticationFailures > 0,
      detailedStats: stats,
    };
  },
});

// Main LinkedIn automation workflow
export const linkedinWorkflow = createWorkflow({
  name: 'LinkedIn Message Automation',
  triggerSchema: linkedinWorkflowInputSchema,
  steps: {
    navigateToLinkedIn: navigateToLinkedInStep,
    generateReplies: generateRepliesStep,
    handleReplies: handleRepliesStep,
  },
  definition: {
    initial: 'navigateToLinkedIn',
    states: {
      navigateToLinkedIn: {
        on: {
          CONTINUE: {
            target: 'generateReplies',
            action: ({ runResults }) => ({
              messages: runResults.navigateToLinkedIn.messages,
              customInstructions: runResults.navigateToLinkedIn.customInstructions,
              replyMode: runResults.navigateToLinkedIn.replyMode,
            }),
          },
        },
      },
      generateReplies: {
        on: {
          CONTINUE: {
            target: 'handleReplies',
            action: ({ runResults }) => ({
              replies: runResults.generateReplies.replies,
              replyMode: runResults.generateReplies.replyMode,
            }),
          },
        },
      },
      handleReplies: {
        type: 'final',
      },
    },
  },
});