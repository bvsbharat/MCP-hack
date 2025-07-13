import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { topic, query } = await request.json();
    
    if (!topic || !query) {
      return NextResponse.json(
        { error: 'Topic and query are required' },
        { status: 400 }
      );
    }

    // Path to the MCP-CrewLink main.py file
    const mcpPath = path.join(process.cwd(), '..', 'MCP-CrewLink');
    const pythonScript = path.join(mcpPath, 'main.py');

    return new Promise((resolve) => {
      const pythonProcess = spawn('python3', [pythonScript], {
        cwd: mcpPath,
        env: {
          ...process.env,
          RESEARCH_TOPIC: topic,
          RESEARCH_QUERY: query
        }
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Parse structured output from Python script
            const structuredOutputMatch = output.match(/=== STRUCTURED_OUTPUT_START ===\n([\s\S]*?)\n=== STRUCTURED_OUTPUT_END ===/);            
            
            if (structuredOutputMatch) {
              const structuredData = JSON.parse(structuredOutputMatch[1]);
              resolve(
                NextResponse.json({
                  success: true,
                  output: output,
                  topic: topic,
                  query: query,
                  timestamp: new Date().toISOString(),
                  structured_data: structuredData,
                  files_generated: structuredData.files_generated || [],
                  images_generated: structuredData.images_generated || []
                })
              );
            } else {
              // Fallback to original format if no structured output found
              resolve(
                NextResponse.json({
                  success: true,
                  output: output,
                  topic: topic,
                  query: query,
                  timestamp: new Date().toISOString(),
                  files_generated: [],
                  images_generated: []
                })
              );
            }
          } catch (parseError) {
            // If JSON parsing fails, return original format
            resolve(
              NextResponse.json({
                success: true,
                output: output,
                topic: topic,
                query: query,
                timestamp: new Date().toISOString(),
                files_generated: [],
                images_generated: [],
                parse_error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
              })
            );
          }
        } else {
          resolve(
            NextResponse.json(
              {
                error: 'Python script execution failed',
                details: errorOutput,
                code: code
              },
              { status: 500 }
            )
          );
        }
      });

      pythonProcess.on('error', (error) => {
        resolve(
          NextResponse.json(
            {
              error: 'Failed to start Python process',
              details: error.message
            },
            { status: 500 }
          )
        );
      });
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}