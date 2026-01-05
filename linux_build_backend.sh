#!/bin/bash

dotnet publish Backend -c Release -r linux-x64 --self-contained -o ./electron/backend-linux


cd frontend && npm install && npm run dev &

sleep 3

cd electron && npm install && npm run dev &