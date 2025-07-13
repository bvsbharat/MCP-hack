from typing import Any, Dict
import httpx
from mcp.server.fastmcp import FastMCP
from openai import OpenAI
import os
import base64

# Initialize FastMCP server
mcp = FastMCP("image_server")

# Use absolute path for output directory
output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "images")

@mcp.tool(name="image_creation_openai", description="Create an image using OpenAI's Images API")
def image_creation_openai(query: str, image_name: str) -> Dict[str, Any]:
    """Create an image using OpenAI's Images API"""
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"), 
        organization=os.getenv("OPENAI_ORGANIZATION")
    )

    try:
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        result = client.images.generate(
            model="gpt-image-1",  # Changed from "gpt-image-1" to valid model
            prompt=f"Generate an image based on the following prompt: {query}",
            size="1024x1024",
            quality="hd",  # Changed from "high" to valid value
            response_format="b64_json"  # Explicitly request base64 format
        )

        # Extract base64 image data
        image_base64 = result.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)

        # Save the image to a file
        file_path = f"{output_dir}/{image_name}.png"
        with open(file_path, "wb") as f:
            f.write(image_bytes)

        return {
            "success": True, 
            "file_path": file_path,
            "message": f"Image saved successfully as {file_path}"
        }
        
    except Exception as e:
        return {
            "success": False, 
            "error": str(e)
        }

if __name__ == "__main__":
    print("Image Creation MCP Server running on stdio")
    mcp.run(transport="stdio")