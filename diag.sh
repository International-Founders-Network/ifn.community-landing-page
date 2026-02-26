#!/bin/bash
echo "PWD: $(pwd)" > diagnostic.txt
echo "NPM: $(npm --version)" >> diagnostic.txt
echo "NODE: $(node --version)" >> diagnostic.txt
echo "LS: $(ls -la)" >> diagnostic.txt
echo "NODE_MODULES: $(ls -la node_modules)" >> diagnostic.txt
