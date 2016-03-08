#!/bin/bash

set -e


printf "\n[-] Installing base OS dependencies...\n\n"

apt-get update -qq -y

DEBIAN_FRONTEND=noninteractive \
  apt-get install -qq -y curl bzip2 build-essential python graphicsmagick
