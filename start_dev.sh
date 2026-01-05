#!/bin/bash

cd frontend && npm install all && npm run dev &

sleep 3

cd electron
npm install all
npm start
