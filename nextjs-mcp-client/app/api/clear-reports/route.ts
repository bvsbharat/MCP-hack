import { NextRequest, NextResponse } from 'next/server';
import { readdir, unlink, stat } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Path to the MCP-CrewLink files and images directories
    const mcpPath = path.join(process.cwd(), '..', 'MCP-CrewLink');
    const filesDir = path.join(mcpPath, 'files');
    const imagesDir = path.join(mcpPath, 'images');

    let filesRemoved = 0;
    let imagesRemoved = 0;
    const errors = [];

    try {
      // Clear files directory
      const filesStat = await stat(filesDir);
      if (filesStat.isDirectory()) {
        const files = await readdir(filesDir);
        
        for (const filename of files) {
          try {
            const filePath = path.join(filesDir, filename);
            await unlink(filePath);
            filesRemoved++;
          } catch (error) {
            errors.push(`Failed to remove file ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    } catch (error) {
      // Files directory doesn't exist, continue
    }

    try {
      // Clear images directory
      const imagesStat = await stat(imagesDir);
      if (imagesStat.isDirectory()) {
        const images = await readdir(imagesDir);
        
        for (const imageName of images) {
          try {
            const imagePath = path.join(imagesDir, imageName);
            await unlink(imagePath);
            imagesRemoved++;
          } catch (error) {
            errors.push(`Failed to remove image ${imageName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    } catch (error) {
      // Images directory doesn't exist, continue
    }

    return NextResponse.json({
      success: true,
      message: 'Reports cleared successfully',
      filesRemoved,
      imagesRemoved,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to clear reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}