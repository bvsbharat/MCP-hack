import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Path to the MCP-CrewLink files and images directories
    const mcpPath = path.join(process.cwd(), '..', 'MCP-CrewLink');
    const filesDir = path.join(mcpPath, 'files');
    const imagesDir = path.join(mcpPath, 'images');

    const reports = [];

    try {
      // Check if files directory exists
      const filesStat = await stat(filesDir);
      if (filesStat.isDirectory()) {
        const files = await readdir(filesDir);
        
        for (const filename of files) {
          if (filename.endsWith('.md') || filename.endsWith('.txt')) {
            const filePath = path.join(filesDir, filename);
            const content = await readFile(filePath, 'utf-8');
            const fileStat = await stat(filePath);
            
            // Determine file type
            const file_type = filename.endsWith('.md') ? 'markdown' : 'text';
            
            // Extract topic from filename (remove extension and format)
            const topic = filename
              .replace(/\.(md|txt)$/, '')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());

            reports.push({
              id: `existing_${filename}_${fileStat.mtime.getTime()}`,
              success: true,
              output: `Loaded existing report: ${filename}`,
              topic: topic,
              query: 'Previously generated report',
              timestamp: fileStat.mtime.toISOString(),
              files_generated: [{
                filename: filename,
                content: content,
                path: filePath,
                file_type: file_type
              }],
              images_generated: [],
              isExisting: true
            });
          }
        }
      }
    } catch (error) {
      // Files directory doesn't exist or is empty, continue
    }

    try {
      // Check if images directory exists and has images
      const imagesStat = await stat(imagesDir);
      if (imagesStat.isDirectory()) {
        const images = await readdir(imagesDir);
        
        for (const imageName of images) {
          if (imageName.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
            const imagePath = path.join(imagesDir, imageName);
            const imageContent = await readFile(imagePath);
            const base64 = imageContent.toString('base64');
            const imageStat = await stat(imagePath);
            
            // Find corresponding report or create standalone image report
            const correspondingReport = reports.find(report => 
              imageName.toLowerCase().includes(report.topic.toLowerCase().replace(/\s+/g, '_'))
            );
            
            if (correspondingReport) {
              correspondingReport.images_generated.push({
                filename: imageName,
                base64: base64,
                path: imagePath
              });
            } else {
              // Create standalone image report
              const topic = imageName
                .replace(/\.(png|jpg|jpeg|gif|svg)$/i, '')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
                
              reports.push({
                id: `existing_image_${imageName}_${imageStat.mtime.getTime()}`,
                success: true,
                output: `Loaded existing image: ${imageName}`,
                topic: topic,
                query: 'Previously generated image',
                timestamp: imageStat.mtime.toISOString(),
                files_generated: [],
                images_generated: [{
                  filename: imageName,
                  base64: base64,
                  path: imagePath
                }],
                isExisting: true
              });
            }
          }
        }
      }
    } catch (error) {
      // Images directory doesn't exist or is empty, continue
    }

    // Sort reports by timestamp (newest first)
    reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      reports: reports,
      count: reports.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load existing reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}