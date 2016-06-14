# ProxyFuzzer

Dummy HTTP fuzzer written on Node.js.

<h3>Features</h3>
<p>What can be fuzzed here:</p>
<ol>
<li>Almost all HTTP header options.</li>
<li>GET params.</li>
<li>POST params.</li>
</ol>

<h3>Usage</h3>
<i>node proxy.js</i>
<p>It will start the proxy server on <b>8887</b> port (can be configured in config.js).</p>
<p>Script will automatically start fuzzing (yet replace with random string) headers, POST and GET params, so the website may not be rendered properly.</p>
<p><b>HTTPS</b> will work properly as script will only transmit in original state.
