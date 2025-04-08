"""
Run script for Document Processor application.

This script starts both the backend Flask API and the frontend React application.
"""

import os
import sys
import subprocess
import threading
import time
import webbrowser
import signal
import atexit

# Configuration
BACKEND_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'backend')
FRONTEND_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'frontend')
BACKEND_PORT = 5000
FRONTEND_PORT = 3000
APP_URL = f"http://localhost:{FRONTEND_PORT}"

# Global process variables
backend_process = None
frontend_process = None

def start_backend():
    """Start the Flask backend server."""
    global backend_process
    
    os.chdir(BACKEND_PATH)
    print(f"Starting backend server on port {BACKEND_PORT}...")
    
    # Set FLASK_APP environment variable
    env = os.environ.copy()
    env["FLASK_APP"] = "app.py"
    
    # Start Flask server
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "flask", "run", "--port", str(BACKEND_PORT)],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True
    )
    
    # Monitor backend output
    for line in iter(backend_process.stdout.readline, ""):
        print(f"[Backend] {line.strip()}")
        if "Running on" in line:
            print(f"Backend server started successfully at http://localhost:{BACKEND_PORT}")
            break
    
    # Continue monitoring in a separate thread
    def monitor_backend():
        for line in iter(backend_process.stdout.readline, ""):
            print(f"[Backend] {line.strip()}")
    
    threading.Thread(target=monitor_backend, daemon=True).start()

def start_frontend():
    """Start the React frontend development server."""
    global frontend_process
    
    os.chdir(FRONTEND_PATH)
    print(f"Starting frontend server on port {FRONTEND_PORT}...")
    
    # Check if node_modules exists, if not run npm install
    if not os.path.exists(os.path.join(FRONTEND_PATH, "node_modules")):
        print("Installing frontend dependencies (this may take a few minutes)...")
        subprocess.run(["npm", "install"], check=True)
    
    # Start React development server
    frontend_process = subprocess.Popen(
        ["npm", "start"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        env={**os.environ, "PORT": str(FRONTEND_PORT)}
    )
    
    # Monitor frontend output
    started = False
    for line in iter(frontend_process.stdout.readline, ""):
        print(f"[Frontend] {line.strip()}")
        if "Compiled successfully" in line or "Starting the development server" in line:
            print(f"Frontend server started successfully at {APP_URL}")
            started = True
            break
    
    # Continue monitoring in a separate thread
    def monitor_frontend():
        for line in iter(frontend_process.stdout.readline, ""):
            print(f"[Frontend] {line.strip()}")
            # If we see the compiled successfully message, open the browser
            if not started and ("Compiled successfully" in line or "Starting the development server" in line):
                print(f"Frontend server started successfully at {APP_URL}")
                time.sleep(2)
                webbrowser.open(APP_URL)
    
    threading.Thread(target=monitor_frontend, daemon=True).start()
    
    # Open browser after a short delay
    if started:
        time.sleep(2)
        webbrowser.open(APP_URL)

def cleanup():
    """Clean up processes on exit."""
    print("\nShutting down servers...")
    
    if backend_process:
        backend_process.terminate()
        print("Backend server stopped.")
    
    if frontend_process:
        frontend_process.terminate()
        print("Frontend server stopped.")

def signal_handler(sig, frame):
    """Handle interrupt signals."""
    cleanup()
    sys.exit(0)

def main():
    """Main function to start the application."""
    print("Starting Document Processor application...")
    
    # Register cleanup handlers
    atexit.register(cleanup)
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Start backend first
        start_backend()
        time.sleep(2)  # Give backend time to start
        
        # Then start frontend
        start_frontend()
        
        print("\nBoth servers are running. Press Ctrl+C to stop.\n")
        
        # Keep the script running
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            if backend_process.poll() is not None:
                print("Backend server stopped unexpectedly. Exiting...")
                break
            
            if frontend_process.poll() is not None:
                print("Frontend server stopped unexpectedly. Exiting...")
                break
    
    except KeyboardInterrupt:
        print("\nReceived keyboard interrupt.")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        cleanup()

if __name__ == "__main__":
    main()
