"""
Setup script for Document Processor application.

This script initializes the project structure and creates necessary directories.
"""

import os
import sys
import shutil
import argparse

# Project root directory
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

# Directory structure
DIRECTORIES = [
    os.path.join(ROOT_DIR, "data", "raw"),
    os.path.join(ROOT_DIR, "data", "processed"),
    os.path.join(ROOT_DIR, "src", "backend"),
    os.path.join(ROOT_DIR, "src", "frontend"),
    os.path.join(ROOT_DIR, "src", "models"),
    os.path.join(ROOT_DIR, "src", "utils"),
    os.path.join(ROOT_DIR, "tests"),
]

def create_directories():
    """Create the project directory structure."""
    print("Creating project directory structure...")
    
    for directory in DIRECTORIES:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Created: {directory}")
        else:
            print(f"Already exists: {directory}")

def main():
    """Main function to set up the project."""
    parser = argparse.ArgumentParser(description="Set up the Document Processor project")
    parser.add_argument("--clean", action="store_true", help="Clean data directories before setup")
    args = parser.parse_args()
    
    if args.clean:
        # Clean data directories
        data_dir = os.path.join(ROOT_DIR, "data")
        if os.path.exists(data_dir):
            print(f"Cleaning data directory: {data_dir}")
            shutil.rmtree(os.path.join(data_dir, "raw"), ignore_errors=True)
            shutil.rmtree(os.path.join(data_dir, "processed"), ignore_errors=True)
    
    # Create directories
    create_directories()
    
    print("\nProject setup complete!")
    print("\nNext steps:")
    print("1. Install backend dependencies: pip install -r requirements.txt")
    print("2. Install frontend dependencies: cd src/frontend && npm install")
    print("3. Run the application: python run.py")

if __name__ == "__main__":
    main()
