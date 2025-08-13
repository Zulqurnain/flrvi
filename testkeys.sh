#!/bin/bash

while read -r key; do
  echo "🔍 Testing key: $key"

  response=$(curl -s -o /dev/null -w "%{http_code}" https://api.openai.com/v1/models \
    -H "Authorization: Bearer $key")

  if [ "$response" == "200" ]; then
    echo "✅ VALID KEY: $key"
  elif [ "$response" == "401" ]; then
    echo "❌ INVALID KEY: $key"
  elif [ "$response" == "429" ]; then
    echo "⚠️ VALID BUT RATE-LIMITED/QUOTA EXCEEDED: $key"
  else
    echo "❓ UNKNOWN RESPONSE ($response): $key"
  fi

  echo "-----------------------"
done < openaikeys.txt
