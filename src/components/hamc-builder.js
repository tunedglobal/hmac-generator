import React, { useState, useEffect, useRef } from "react";

import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Overlay from "react-bootstrap/Overlay";
import Tooltip from "react-bootstrap/Tooltip";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { Alert } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";

import { enc, HmacSHA256 } from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import { DebounceInput } from "react-debounce-input";
import { CopyToClipboard } from "react-copy-to-clipboard";
import CryptoJS from 'crypto-js';

import { FaRegCopy, FaCompressAlt } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { ImInfo } from "react-icons/im";

function HMACBuilder() {
    const getCurrentTimestamp = () => {
        const now = Date.now();
        const epochStart = Date.UTC(1970, 0, 1, 0, 0, 0, 0);
        const timestamp = Math.floor((now - epochStart) / 1000).toString();

        return timestamp;
    };

    const [accessKey, setAccessKey] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [url, setUrl] = useState("");
    const [payload, setPayload] = useState("");
    const [isJsonPayloadValid, setIsJsonPayloadValid] = useState(true);
    const [hmac, setHMAC] = useState("");
    const [nonce, setNonce] = useState(uuidv4());
    const [timestamp, setTimestamp] = useState(getCurrentTimestamp());
    const [signatureRaw, setSignatureRaw] = useState("");
    const [signatureHash, setSignatureHash] = useState("");
    const [httpMethod, setHttpMethod] = useState("GET");

    const [show, setShow] = useState(false);
    const target = useRef(null);

    const handleAccessKeyChange = (event) => {
        setAccessKey(event.target.value);
    };

    const handleSecretKeyChange = (event) => {
        setSecretKey(event.target.value);
    };

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
    };

    const handlePayloadChange = (event) => {
        const value = event.target.value;
        setPayload(value);

        if(value.length == 0 ) {
            setIsJsonPayloadValid(true);
            return;
        }

        try {
            JSON.parse(value);
            setIsJsonPayloadValid(true);
        } catch (e) {
            setIsJsonPayloadValid(false);
        }
    };

    const handleNonceChange = (event) => {
        setNonce(event.target.value);
    };

    const handleTimestampChange = (event) => {
        setTimestamp(event.target.value);
    };

    const handleHttpMethodChange = (event) => {
        setHttpMethod(event.target.value);
    };

    const handleCopyClick = () => {
        setShow(true);
        setTimeout(() => {
            setShow(false);
        }, 500);
    };

    const refreshNonceAndTimestamp = () => {
        setNonce(uuidv4());
        setTimestamp(getCurrentTimestamp());
    };

    const minifyPostPayload = () => {

        if(!isJsonPayloadValid || payload.length < 1){
            return;
        }
            
        const minified = JSON.stringify(JSON.parse(payload));
        setPayload(minified);
    };

    const resetForm = () => {
        setAccessKey("");
        setSecretKey("");
        setHttpMethod("GET");
        setUrl("");
        setPayload("");
        setHMAC("");
        setNonce(uuidv4());
        setSignatureRaw("");
        setSignatureHash("");
        setTimestamp(getCurrentTimestamp());
    };

    const encode = (url) => {
        const uriEncoded = encodeURIComponent(url);
        return uriEncoded.replace(/%\w\w/g, (match) => match.toLowerCase());
    };

    const generateHMAC = () => {
        let authCode = "";
        let signatureRawData = "";

        if (accessKey.length === 0 || secretKey.length === 0 || url.length === 0 || nonce.length === 0 || timestamp.length === 0) {
            setHMAC(authCode);
            return;
        }

        const uri = encode(url);

        if (httpMethod == "POST") {

            let base64Hash = "";
            
            if(payload.length > 0) {
                // Normalize the value in the textbox since in C# it wuold add the \r\n but in textarea its only \n
                const normalizedPayload = payload.replace(/\n/g, '\r\n');
                const md5Hash = CryptoJS.MD5(CryptoJS.enc.Utf8.parse(normalizedPayload));
                base64Hash = CryptoJS.enc.Base64.stringify(md5Hash);
            }

            signatureRawData = `${accessKey}${httpMethod}${uri}${base64Hash}${nonce}${timestamp}`;
        }
        else {
            signatureRawData = `${accessKey}${httpMethod}${uri}${nonce}${timestamp}`;
        }

        const signatureBytes = enc.Utf8.parse(signatureRawData);
        const secretKeyBytes = enc.Base64.parse(secretKey);
        const signature = HmacSHA256(signatureBytes, secretKeyBytes);
        const requestSignatureBase64String = signature.toString(enc.Base64);

        authCode = `${accessKey}:${requestSignatureBase64String}:${nonce}:${timestamp}`;

        setSignatureRaw(signatureRawData);
        setSignatureHash(requestSignatureBase64String);
        setHMAC(authCode);
    };

    useEffect(() => {
        generateHMAC();
    }, [accessKey, secretKey, url, nonce, timestamp, httpMethod, payload]);

    return (
        <Container>
            <Row>
                <Col>
                    <h3 className="text-center display-6 py-2">HMAC Generator</h3>
                    <div className="lead py-2">
                        <small>
                            Hash-based message authentication code (HMAC) is a mechanism for calculating a message authentication code involving a hash function in combination with a secret key. This
                            can be used to verify the integrity and authenticity of a message. HMAC Generator generates HMAC with a timestamp and nonce instantly for a URL.
                        </small>
                    </div>
                </Col>
            </Row>
            <Alert key="primary" variant="primary">
                <ImInfo size={20} className="mb-1" /> This tool runs on your browser only and does not send any data to our server.
            </Alert>
            <Row>
                <Col lg={6} className="pt-2">
                    <Card className="text-start">
                        <Card.Header>Input</Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="3">
                                        Http Method
                                    </Form.Label>
                                    <Form.Label column sm="3">
                                        <Form.Select defaultValue="GET" onChange={handleHttpMethodChange}>
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                        </Form.Select>
                                    </Form.Label>
                                    <Form.Label column sm="3">
                                        Algorithm
                                    </Form.Label>
                                    <Col sm="3">
                                        <Form.Control disabled defaultValue="SHA256" />
                                    </Col>
                                </Form.Group>
                                <hr />
                                 <Row hidden={httpMethod !== "POST"}>
                                    <Col className="text-end" style={{ padding: "0px 10px 5px 0px" }}>
                                        <Button variant="primary" size="sm" onClick={minifyPostPayload} title="Minify payload. Please make sure both payloads from the requester is the same.">
                                            <FaCompressAlt size={16} />
                                        </Button>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3" hidden={httpMethod !== "POST"}>
                                    <Form.Label>Payload</Form.Label>
                                    <DebounceInput element="textarea" value={payload} className="form-control" minLength={2} debounceTimeout={500} onChange={handlePayloadChange} />
                                     {!isJsonPayloadValid && (<div className="text-danger mt-1">Payload must be valid JSON.</div>)}
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Url</Form.Label>
                                    <DebounceInput element="textarea" value={url} className="form-control" minLength={2} debounceTimeout={500} onChange={handleUrlChange} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Access Key</Form.Label>
                                    <DebounceInput className="form-control" value={accessKey} minLength={2} debounceTimeout={500} onChange={handleAccessKeyChange} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Secret Key</Form.Label>
                                    <DebounceInput className="form-control" value={secretKey} minLength={2} debounceTimeout={500} onChange={handleSecretKeyChange} />
                                </Form.Group>
                                <hr style={{ marginBottom: "10px" }} />
                                <Row>
                                    <Col className="text-end" style={{ padding: "0px 10px 5px 0px" }}>
                                        <Button variant="primary" size="sm" onClick={refreshNonceAndTimestamp} title="Refresh nonce and timestamp">
                                            <FiRefreshCcw size={16} />
                                        </Button>
                                    </Col>
                                </Row>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="2">
                                        Nonce
                                    </Form.Label>
                                    <Col sm="8">
                                        <DebounceInput className="form-control" value={nonce} minLength={2} debounceTimeout={500} onChange={handleNonceChange} />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm="2">
                                        Timestamp
                                        <i className="small">(seconds)</i>
                                    </Form.Label>
                                    <Col sm="8">
                                        <DebounceInput className="form-control" value={timestamp} minLength={2} debounceTimeout={500} onChange={handleTimestampChange} />
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                        <Card.Footer>
                            <Button variant="primary" size="lg" onClick={resetForm}>
                                Reset
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
                <Col lg={6} className="pt-2">
                    <Card className="text-start">
                        <Card.Header>Output</Card.Header>
                        <Card.Body>
                            <Card.Text className="text-start text-weight-300">Intermediate results</Card.Text>
                            <Accordion alwaysOpen className="pb-4">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Request Signature - raw</Accordion.Header>
                                    <Accordion.Body>{signatureRaw.length > 0 ? signatureRaw : "None"}</Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Request Signature - hash</Accordion.Header>
                                    <Accordion.Body>{signatureHash.length > 0 ? signatureHash : "None"}</Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <Card.Text className="text-start mb-0 text-weight-300">Results</Card.Text>
                            <Card.Text className="text-end mb-2">
                                <CopyToClipboard text={`Tuned-HMAC ${hmac}`}>
                                    <span ref={target} onClick={handleCopyClick}>
                                        <FaRegCopy size={16} className="copy-icon" title="Copy to clipboard" />
                                    </span>
                                </CopyToClipboard>
                            </Card.Text>
                            <InputGroup className="mb-3">
                                <InputGroup.Text>Tuned-HMAC</InputGroup.Text>
                                <Form.Control disabled defaultValue={hmac} />
                            </InputGroup>
                            {target.current && (
                                <Overlay target={target.current} show={show} placement="top">
                                    {(props) => (
                                        <Tooltip id="copy-tooltip" {...props}>
                                            Copied!
                                        </Tooltip>
                                    )}
                                </Overlay>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default HMACBuilder;
