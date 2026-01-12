import { useState } from 'react';
import { Network, Copy, Check, Calculator } from 'lucide-react';

interface IPInfo {
    ip: string;
    binary: string;
    decimal: number;
    hex: string;
    octal: string;
}

interface SubnetInfo {
    network: string;
    broadcast: string;
    firstHost: string;
    lastHost: string;
    totalHosts: number;
    mask: string;
    cidr: number;
}

function ipToNumber(ip: string): number {
    const parts = ip.split('.').map(Number);
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function numberToIP(num: number): string {
    return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
    ].join('.');
}

function isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every((p) => {
        const num = parseInt(p);
        return !isNaN(num) && num >= 0 && num <= 255;
    });
}

export default function IPCalculator() {
    const [ip, setIp] = useState('192.168.1.1');
    const [cidr, setCidr] = useState(24);
    const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
    const [subnetInfo, setSubnetInfo] = useState<SubnetInfo | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const calculate = () => {
        if (!isValidIP(ip)) return;

        const ipNum = ipToNumber(ip);

        // IP Info
        setIpInfo({
            ip,
            binary: ipNum.toString(2).padStart(32, '0').match(/.{8}/g)?.join('.') || '',
            decimal: ipNum,
            hex: '0x' + ipNum.toString(16).padStart(8, '0').toUpperCase(),
            octal: '0' + ipNum.toString(8),
        });

        // Subnet Info
        const maskNum = (0xFFFFFFFF << (32 - cidr)) >>> 0;
        const networkNum = (ipNum & maskNum) >>> 0;
        const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;
        const totalHosts = Math.pow(2, 32 - cidr) - 2;

        setSubnetInfo({
            network: numberToIP(networkNum),
            broadcast: numberToIP(broadcastNum),
            firstHost: numberToIP(networkNum + 1),
            lastHost: numberToIP(broadcastNum - 1),
            totalHosts: Math.max(0, totalHosts),
            mask: numberToIP(maskNum),
            cidr,
        });
    };

    const handleCopy = (value: string, key: string) => {
        navigator.clipboard.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-4">
            {/* Input */}
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">IP Address</label>
                    <input
                        type="text"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        placeholder="192.168.1.1"
                        className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500 font-mono"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">CIDR</label>
                    <input
                        type="number"
                        min="0"
                        max="32"
                        value={cidr}
                        onChange={(e) => setCidr(Math.min(32, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-md focus:outline-none focus:border-cyber-500 font-mono"
                    />
                </div>
            </div>

            {/* Calculate Button */}
            <button
                onClick={calculate}
                disabled={!isValidIP(ip)}
                className="w-full py-2 text-sm font-medium bg-cyber-600 hover:bg-cyber-700 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
            >
                <Calculator size={16} />
                Calculate
            </button>

            {/* IP Info */}
            {ipInfo && (
                <div className="space-y-2">
                    <label className="block text-xs text-gray-400">IP Formats</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Decimal', value: ipInfo.decimal.toString() },
                            { label: 'Hex', value: ipInfo.hex },
                            { label: 'Octal', value: ipInfo.octal },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="px-2 py-1.5 bg-dark-800 border border-dark-700 rounded-md group flex items-center justify-between"
                            >
                                <div>
                                    <span className="text-[10px] text-gray-500">{item.label}</span>
                                    <p className="text-xs font-mono text-gray-300">{item.value}</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(item.value, item.label)}
                                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-dark-600 rounded transition-all"
                                >
                                    {copied === item.label ? <Check size={10} className="text-cyber-400" /> : <Copy size={10} />}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="px-2 py-1.5 bg-dark-800 border border-dark-700 rounded-md">
                        <span className="text-[10px] text-gray-500">Binary</span>
                        <p className="text-[10px] font-mono text-gray-300 break-all">{ipInfo.binary}</p>
                    </div>
                </div>
            )}

            {/* Subnet Info */}
            {subnetInfo && (
                <div className="space-y-2">
                    <label className="block text-xs text-gray-400">Subnet Info</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Network', value: subnetInfo.network },
                            { label: 'Broadcast', value: subnetInfo.broadcast },
                            { label: 'First Host', value: subnetInfo.firstHost },
                            { label: 'Last Host', value: subnetInfo.lastHost },
                            { label: 'Subnet Mask', value: subnetInfo.mask },
                            { label: 'Total Hosts', value: subnetInfo.totalHosts.toLocaleString() },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="px-2 py-1.5 bg-dark-800 border border-dark-700 rounded-md group flex items-center justify-between"
                            >
                                <div>
                                    <span className="text-[10px] text-gray-500">{item.label}</span>
                                    <p className="text-xs font-mono text-gray-300">{item.value}</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(item.value, item.label)}
                                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-dark-600 rounded transition-all"
                                >
                                    {copied === item.label ? <Check size={10} className="text-cyber-400" /> : <Copy size={10} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
