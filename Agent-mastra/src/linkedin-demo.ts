import 'dotenv/config';
import { mastra } from './mastra/index';
import chalk from 'chalk';

/**
 * LinkedIn Automation Demo
 * 
 * This demo shows how to use the LinkedIn agent with Playwright MCP to:
 * 1. Navigate to LinkedIn messaging
 * 2. Read and analyze messages
 * 3. Generate contextual replies
 * 4. Handle replies based on the specified mode
 */

async function runLinkedInDemo() {
  console.log(chalk.blue('🚀 Starting LinkedIn Automation Demo'));
  console.log(chalk.yellow('=' .repeat(50)));
  // Check for LinkedIn credentials
  const linkedinEmail = process.env.LINKEDIN_EMAIL;
  const linkedinPassword = process.env.LINKEDIN_PASSWORD;
  
  if (!linkedinEmail || !linkedinPassword) {
    console.log(chalk.red('❌ LinkedIn credentials not found in .env file'));
    console.log(chalk.yellow('Please add LINKEDIN_EMAIL and LINKEDIN_PASSWORD to your .env file'));
    return;
  }

  console.log(chalk.green(`✅ LinkedIn credentials loaded for: ${linkedinEmail}`));

  try {
    // Get the LinkedIn agent
    const linkedinAgent = mastra.getAgent('linkedinAgent');
    if (!linkedinAgent) {
      throw new Error('LinkedIn agent not found');
    }

    console.log(chalk.green('✅ LinkedIn agent loaded successfully'));

    // Demo 0: LinkedIn Authentication with Real Credentials
    console.log(chalk.blue('\n🔐 Demo 0: LinkedIn Authentication'));
    
    const authPrompt = `
      Use Playwright to log into LinkedIn with the following credentials:
      Email: ${linkedinEmail}
      Password: ${linkedinPassword}
      
      Please perform these steps:
      1. Navigate to https://www.linkedin.com/login
      2. Fill in the email field with the provided email
      3. Fill in the password field with the provided password
      4. Click the sign-in button
      5. Handle any potential 2FA or security challenges
      6. Wait for successful login and navigate to messaging
      7. Extract any unread messages
      
      Use the Playwright MCP tools to perform these actions.
    `;

    console.log(chalk.yellow('🔑 Attempting LinkedIn login...'));
    
    try {
      const authResponse = await linkedinAgent.generate(authPrompt, {
        maxSteps: 10,
        resourceId: 'demo-user',
        threadId: 'linkedin-auth',
      });

      console.log(chalk.green('\n🎯 Authentication Result:'));
      console.log(chalk.white(authResponse.text));
    } catch (error) {
      console.log(chalk.red('❌ Authentication failed:'), error);
      console.log(chalk.yellow('💡 This might be due to LinkedIn security measures or 2FA'));
    }

    // Demo 1: Simple message analysis and reply generation
    console.log(chalk.blue('\n📧 Demo 1: Analyzing a sample LinkedIn message'));
    
    const sampleMessage = {
      sender: "John Smith",
      content: "Hi! I noticed we both work in AI/ML. I'd love to connect and potentially discuss some collaboration opportunities. I'm working on some exciting projects in the automation space.",
      context: "Connection request from a fellow AI professional"
    };

    console.log(chalk.cyan(`Message from: ${sampleMessage.sender}`));
    console.log(chalk.white(`Content: "${sampleMessage.content}"`));

    const replyPrompt = `
      Analyze this LinkedIn message and generate an appropriate professional reply:
      
      Sender: ${sampleMessage.sender}
      Message: "${sampleMessage.content}"
      Context: ${sampleMessage.context}
      
      Please provide a professional, engaging reply that:
      - Acknowledges their interest
      - Shows genuine enthusiasm for connection
      - Suggests a next step (like a brief call or coffee chat)
      - Maintains a professional but friendly tone
      - Is concise (50-100 words)
    `;

    console.log(chalk.yellow('\n🤖 Generating reply...'));
    
    const replyResponse = await linkedinAgent.generate(replyPrompt, {
      maxSteps: 3,
      resourceId: 'demo-user',
      threadId: 'linkedin-demo-1',
    });

    console.log(chalk.green('\n✨ Generated Reply:'));
    console.log(chalk.white(`"${replyResponse.text}"`));

    // Demo 2: Playwright automation simulation
    console.log(chalk.blue('\n🎭 Demo 2: Playwright LinkedIn Navigation Simulation'));
    
    const navigationPrompt = `
      Simulate navigating to LinkedIn and reading messages using Playwright.
      
      Tasks to perform:
      1. Open LinkedIn.com
      2. Navigate to the messaging section
      3. Identify unread messages
      4. Extract message details
      
      Please describe the step-by-step process you would use with Playwright to:
      - Handle LinkedIn's authentication
      - Wait for dynamic content to load
      - Locate message elements
      - Extract message text and sender information
      
      Note: This is a simulation for demo purposes.
    `;

    console.log(chalk.yellow('🔍 Simulating LinkedIn navigation...'));
    
    const navigationResponse = await linkedinAgent.generate(navigationPrompt, {
      maxSteps: 5,
      resourceId: 'demo-user',
      threadId: 'linkedin-demo-2',
    });

    console.log(chalk.green('\n🎯 Navigation Strategy:'));
    console.log(chalk.white(navigationResponse.text));

    // Demo 3: LinkedIn Workflow - Login and Draft Creation
     console.log(chalk.blue('\n⚡ Demo 3: LinkedIn Workflow - Step-by-Step Execution'));
     console.log(chalk.yellow('Step 1: Login to LinkedIn (with user assistance if needed)'));
     console.log(chalk.yellow('Step 2: Open messages and create draft replies for all messages'));
     
     const workflowInput = {
       linkedinUrl: 'https://www.linkedin.com/messaging/',
       replyMode: 'draft' as const,
       maxMessages: 50,
       processAllMessages: true,
       customInstructions: 'Create professional draft replies for all messages. Focus on building genuine connections and providing helpful responses.',
       credentials: {
         email: linkedinEmail,
         password: linkedinPassword,
       },
     };

    console.log(chalk.cyan('Enhanced Workflow Input:'));
    console.log(chalk.white(JSON.stringify(workflowInput, null, 2)));

    console.log(chalk.yellow('\n🔄 Executing enhanced LinkedIn workflow...'));
    
    try {
      const workflowResult = await mastra.getWorkflow('linkedinWorkflow')?.execute(workflowInput);
      
      if (workflowResult) {
        console.log(chalk.green('\n✅ Workflow completed successfully!'));
        
        console.log(chalk.cyan('\n--- Workflow Results ---'));
        console.log(chalk.white('Summary:'), workflowResult.summary);
        
        if (workflowResult.authenticationRequired) {
          console.log(chalk.red('\n⚠️  AUTHENTICATION REQUIRED:'));
          console.log(chalk.yellow('Error:'), workflowResult.errorMessage);
          console.log(chalk.yellow('Please check your LinkedIn credentials or handle 2FA manually.'));
        }
        
        if (workflowResult.authenticationIssues) {
          console.log(chalk.yellow('\n⚠️  Authentication issues encountered during processing.'));
          console.log(chalk.white('Detailed stats:'), workflowResult.detailedStats);
        }
        
        console.log(chalk.cyan('\n--- Processing Statistics ---'));
        console.log(chalk.white(`Total messages found: ${workflowResult.totalMessagesFound || 'N/A'}`));
        console.log(chalk.white(`Total replies generated: ${workflowResult.totalRepliesGenerated || 'N/A'}`));
        
        if (workflowResult.processingStats) {
          console.log(chalk.white('Priority breakdown:'), workflowResult.processingStats);
        }
        
        if (workflowResult.detailedStats) {
          console.log(chalk.white('Reply handling stats:'), workflowResult.detailedStats);
        }
        
        console.log(chalk.cyan('\n--- Sample Processed Replies ---'));
        workflowResult.processedReplies?.slice(0, 3).forEach((reply, index) => {
          console.log(chalk.white(`${index + 1}. Message ID: ${reply.messageId}`));
          console.log(chalk.white(`   Status: ${reply.status}`));
          console.log(chalk.white(`   Priority: ${reply.priority || 'N/A'}`));
          console.log(chalk.white(`   Type: ${reply.messageType || 'N/A'}`));
          console.log(chalk.white(`   Sender: ${reply.sender || 'N/A'}`));
          console.log(chalk.white(`   Action: ${reply.action}`));
          console.log('');
        });
      } else {
        console.log(chalk.red('❌ Workflow not found or failed to execute'));
      }
    } catch (error) {
      console.log(chalk.red('❌ Workflow execution failed:'), error);
      console.log(chalk.yellow('💡 This is expected in demo mode without actual LinkedIn access'));
    }

    // Demo 4: Memory and context demonstration
    console.log(chalk.blue('\n🧠 Demo 4: Memory and Context Management'));
    
    const contextPrompt = `
      Remember this conversation context for future interactions:
      
      User Profile:
      - Name: Demo User
      - Industry: Technology/AI
      - Interests: Automation, Machine Learning, Professional Networking
      - Communication Style: Professional but approachable
      
      Recent LinkedIn Activity:
      - Connected with 3 AI professionals this week
      - Shared an article about automation trends
      - Looking for collaboration opportunities
      
      Please acknowledge this context and explain how you would use it to personalize future LinkedIn interactions.
    `;

    const contextResponse = await linkedinAgent.generate(contextPrompt, {
      maxSteps: 2,
      resourceId: 'demo-user',
      threadId: 'linkedin-context',
    });

    console.log(chalk.green('\n🎯 Context Understanding:'));
    console.log(chalk.white(contextResponse.text));

    // Demo 5: Best practices and safety
    console.log(chalk.blue('\n🛡️ Demo 5: Safety and Best Practices'));
    
    const safetyPrompt = `
      Explain the best practices for LinkedIn automation to ensure:
      1. Compliance with LinkedIn's terms of service
      2. Avoiding detection as automated behavior
      3. Maintaining authentic professional relationships
      4. Respecting rate limits and user privacy
      
      Provide specific recommendations for safe automation practices.
    `;

    const safetyResponse = await linkedinAgent.generate(safetyPrompt, {
      maxSteps: 2,
      resourceId: 'demo-user',
      threadId: 'linkedin-safety',
    });

    console.log(chalk.green('\n🔒 Safety Guidelines:'));
    console.log(chalk.white(safetyResponse.text));

    console.log(chalk.blue('\n' + '=' .repeat(50)));
    console.log(chalk.green('🎉 LinkedIn Automation Demo Completed Successfully!'));
    console.log(chalk.yellow('\n💡 Next Steps:'));
    console.log(chalk.white('1. Set up LinkedIn credentials and authentication'));
    console.log(chalk.white('2. Configure Playwright for your specific LinkedIn setup'));
    console.log(chalk.white('3. Test with a small number of messages first'));
    console.log(chalk.white('4. Gradually increase automation based on results'));
    console.log(chalk.white('5. Monitor for any LinkedIn policy changes'));

  } catch (error) {
    console.error(chalk.red('❌ Demo failed:'), error);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runLinkedInDemo().catch(console.error);
}

export { runLinkedInDemo };