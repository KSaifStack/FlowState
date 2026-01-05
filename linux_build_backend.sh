#!/bin/bash

cd frontend && npm install && npm run dev &

sleep 3

dotnet publish Backend -c Release -r linux-x64 --self-contained -o ./electron/backend-linux && cd electron && npm install && npm run dev &