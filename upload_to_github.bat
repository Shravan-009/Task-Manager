@echo off
echo Initializing Git repository...
git init

echo Adding files...
git add .

echo Committing changes...
git commit -m "Initial commit including Docker setup"

echo Renaming branch to main...
git branch -M main

echo Adding remote repository...
git remote add origin https://github.com/Shravan-009/Task-Manager.git

echo Pushing to GitHub...
git push -u origin main

echo.
echo Process complete!
pause
