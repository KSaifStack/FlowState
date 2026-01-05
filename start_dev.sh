#!/bin/bash

cd frontend && npm install && npm run dev &

sleep 3

cd electron && npm install && npm run dev &