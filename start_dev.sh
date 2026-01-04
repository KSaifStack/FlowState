#!/bin/bash

cd frontend && npm run dev &

sleep 3

cd electron
npm start
