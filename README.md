# hmac-generator

Hash-based message authentication code (HMAC) is a mechanism for calculating a message authentication code involving a hash function in combination with a secret key. This can be used to verify the integrity and authenticity of a message. If a party in the middle fiddles with the API call either for malicious reasons, or bug in an intermediary proxy that drops some important headers, the signature will not match.

This is a React project that generates HMAC with a timestamp and nonce instantly for a given URL.

## Installation

To install the project dependencies, run:

``
npm install
``

## Usage

To start the development server, run:

```npm start```

then open [http://localhost:3000](http://localhost:3000) to view it in the browser.