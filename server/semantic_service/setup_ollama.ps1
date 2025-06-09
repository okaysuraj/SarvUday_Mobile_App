# PowerShell script to install Ollama on Windows and pull the required model

# Check if Ollama is already installed
$ollamaInstalled = $false
try {
    $ollamaVersion = ollama --version
    $ollamaInstalled = $true
    Write-Host "Ollama is already installed: $ollamaVersion"
} catch {
    Write-Host "Ollama is not installed. Installing now..."
}

if (-not $ollamaInstalled) {
    # Download the Ollama installer
    $installerUrl = "https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.zip"
    $downloadPath = "$env:TEMP\ollama-windows.zip"
    $extractPath = "$env:USERPROFILE\ollama"
    
    Write-Host "Downloading Ollama..."
    Invoke-WebRequest -Uri $installerUrl -OutFile $downloadPath
    
    # Create directory if it doesn't exist
    if (-not (Test-Path $extractPath)) {
        New-Item -ItemType Directory -Path $extractPath | Out-Null
    }
    
    # Extract the zip file
    Write-Host "Extracting Ollama..."
    Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
    
    # Add to PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if (-not $currentPath.Contains($extractPath)) {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$extractPath", "User")
        $env:Path = "$env:Path;$extractPath"
    }
    
    Write-Host "Ollama installed successfully!"
}

# Pull the embedding model
Write-Host "Pulling the nomic-embed-text model..."
ollama pull nomic-embed-text

Write-Host "Setup complete! You can now run the semantic service with Ollama embeddings."