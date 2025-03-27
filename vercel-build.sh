#!/bin/bash

# वेरसेल पर डिप्लॉयमेंट के लिए बिल्ड स्क्रिप्ट

# फ्रंटएंड (क्लाइंट) बिल्ड करें
echo "Building frontend with Vite..."
npm run build:client

# बैकएंड (सर्वर और API) बिल्ड करें
echo "Building backend files..."
npm run build:api

echo "Build complete!"