#!/bin/bash
# Quick Start Guide for Feedback Board

echo "========================================="
echo "  Feedback Board - Quick Start Guide"
echo "========================================="
echo ""

echo "✅ Installation:"
echo "  npm install"
echo ""

echo "🚀 Run Everything Together (Recommended):"
echo "  npm run dev"
echo ""

echo "🚀 Run Separately:"
echo "  Terminal 1: npm run dev:client"
echo "  Terminal 2: npm run dev:server"
echo ""

echo "📦 Build for Production:"
echo "  npm run build"
echo ""

echo "🌐 URL Mapping:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001"
echo "  API:       http://localhost:3001/api"
echo ""

echo "📂 Current Directory Structure:"
tree -L 3 -I 'node_modules|dist|.next' 2>/dev/null || echo "  (Install 'tree' command to see directory structure)"
echo ""

echo "✨ Ready to code! Happy hacking 🎉"
