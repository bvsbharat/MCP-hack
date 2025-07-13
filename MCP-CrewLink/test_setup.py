#!/usr/bin/env python3
"""
Test script to verify MCP-CrewLink setup without requiring API keys
"""

import os
import sys
from dotenv import load_dotenv

def test_environment():
    """Test if environment variables are loaded correctly"""
    print("🔧 Testing Environment Setup...")
    
    # Load environment variables
    load_dotenv()
    
    # Check if .env file exists
    env_file = ".env"
    if os.path.exists(env_file):
        print(f"✅ .env file found: {env_file}")
    else:
        print(f"❌ .env file not found: {env_file}")
        return False
    
    # Check environment variables (without revealing actual values)
    env_vars = ["OPENAI_API_KEY", "OPENAI_ORGANIZATION", "BRAVE_API_KEY"]
    for var in env_vars:
        value = os.getenv(var)
        if value and value != f"your_{var.lower()}_here":
            print(f"✅ {var} is set")
        else:
            print(f"⚠️  {var} needs to be configured (currently using placeholder)")
    
    return True

def test_dependencies():
    """Test if required Python packages are installed"""
    print("\n📦 Testing Python Dependencies...")
    
    required_packages = [
        "mcp",
        "crewai", 
        "openai",
        "httpx",
        "python-dotenv",
        "pydantic"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == "python-dotenv":
                __import__("dotenv")
            else:
                __import__(package.replace("-", "_"))
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"❌ {package} is missing")
            missing_packages.append(package)
    
    return len(missing_packages) == 0

def test_node_dependencies():
    """Test if required Node.js packages are installed"""
    print("\n🟢 Testing Node.js Dependencies...")
    
    # Test if npm is available
    npm_check = os.system("npm --version > /dev/null 2>&1")
    if npm_check != 0:
        print("❌ npm is not available")
        return False
    else:
        print("✅ npm is available")
    
    # Test if MCP servers are installed
    mcp_servers = [
        "@modelcontextprotocol/server-filesystem",
        "@modelcontextprotocol/server-brave-search"
    ]
    
    for server in mcp_servers:
        # Check if package is installed globally
        check_cmd = f"npm list -g {server} > /dev/null 2>&1"
        if os.system(check_cmd) == 0:
            print(f"✅ {server} is installed globally")
        else:
            print(f"⚠️  {server} may not be installed globally")
    
    return True

def test_directory_structure():
    """Test if required directories and files exist"""
    print("\n📁 Testing Directory Structure...")
    
    required_files = [
        "main.py",
        "requirements.txt",
        "servers/image_server.py",
        ".env"
    ]
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path} exists")
        else:
            print(f"❌ {file_path} is missing")
            return False
    
    # Check if files directory was created
    files_dir = "files"
    if os.path.exists(files_dir):
        print(f"✅ {files_dir} directory exists")
    else:
        print(f"ℹ️  {files_dir} directory will be created when main.py runs")
    
    # Check if images directory exists (will be created by image server)
    images_dir = "images"
    if os.path.exists(images_dir):
        print(f"✅ {images_dir} directory exists")
    else:
        print(f"ℹ️  {images_dir} directory will be created when image server runs")
    
    return True

def main():
    """Run all tests"""
    print("🚀 MCP-CrewLink Setup Verification\n")
    print("=" * 50)
    
    tests = [
        test_environment,
        test_dependencies, 
        test_node_dependencies,
        test_directory_structure
    ]
    
    all_passed = True
    for test in tests:
        try:
            result = test()
            all_passed = all_passed and result
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 Setup verification completed successfully!")
        print("\n📝 Next steps:")
        print("1. Update the .env file with your actual API keys:")
        print("   - OPENAI_API_KEY (from https://platform.openai.com/api-keys)")
        print("   - OPENAI_ORGANIZATION (optional, from OpenAI dashboard)")
        print("   - BRAVE_API_KEY (from https://api.search.brave.com/)")
        print("2. Run 'python main.py' to start the application")
        print("3. Run 'python servers/image_server.py' to test the image server standalone")
    else:
        print("❌ Some issues were found. Please address them before running the application.")
        sys.exit(1)

if __name__ == "__main__":
    main()