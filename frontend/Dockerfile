FROM node:20.16

# stuff needed to get Electron to run
RUN apt-get update && apt-get install \
    make g++ libx11-dev libxtst-dev libpng-dev libxkbcommon-dev libxkbcommon-x11-dev xorg-dev \
    libxcb-xkb-dev x11-xkb-utils xvfb libnss3 libgtk-3-0 libx11-xcb1 libxcomposite1 libxdamage1 \
    libxrandr2 libxss1 libatk-bridge2.0-0 libatk1.0-0 libcups2 libgdk-pixbuf2.0-0 libpango-1.0-0 \
    libpangocairo-1.0-0 libxkbcommon0 libgbm1 libasound2 libdrm2 libpulse0 libpci3 libnspr4 git \
    libxcb-dri3-0 libxtst6 \
    -yq --no-install-suggests --no-install-recommends \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /programmable-matter
COPY src/package*.json ./
COPY src /programmable-matter

RUN useradd -d /programmable-matter programmable-matter
RUN chown -R programmable-matter /programmable-matter

# Electron doesn't like to run as root
USER programmable-matter

RUN npm install
# RUN npx electron-rebuild


# Electron needs root for sandboxing
# see https://github.com/electron/electron/issues/17972
USER root
RUN chown root /programmable-matter/node_modules/electron/dist/chrome-sandbox
RUN chmod 4755 /programmable-matter/node_modules/electron/dist/chrome-sandbox


USER programmable-matter

CMD ["npm", "start"]
