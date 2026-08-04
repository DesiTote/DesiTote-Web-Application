export const emailLayout = ({ title, preview, body, }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${preview ?? title}</title>
</head>

<body style="
margin:0;
padding:40px 0;
background:#F5EEDE;
font-family:Arial,sans-serif;
">

<table align="center"
style="
width:620px;
background:#ffffff;
border-radius:18px;
overflow:hidden;
border:1px solid #ECE2CF;
">

<tr>
<td
style="
background:#1B2A41;
padding:40px;
text-align:center;
">

<h1
style="
margin:0;
color:#F5EEDE;
font-size:34px;
">
DesiTotes
</h1>

<p
style="
margin-top:10px;
color:#C6941E;
font-size:14px;
letter-spacing:2px;
">
Carry Culture. Carry Sustainability.
</p>

</td>
</tr>

<tr>

<td
style="
padding:42px;
">

<h2
style="
margin-top:0;
color:#1B2A41;
font-size:28px;
">
${title}
</h2>

${body}

</td>

</tr>

<tr>

<td
style="
background:#FBF8F1;
padding:28px;
text-align:center;
border-top:1px solid #ECE2CF;
">

<p
style="
margin:0;
color:#1B2A41;
font-weight:bold;
">
Need help?
</p>

<p>
<a
href="mailto:desitotes0401@gmail.com"
style="
color:#7A2A28;
text-decoration:none;
"
>
desitotes0401@gmail.com
</a>
</p>

<p
style="
font-size:12px;
color:#777;
margin-top:24px;
">
© ${new Date().getFullYear()} DesiTotes. All rights reserved.
</p>

</td>

</tr>

</table>

</body>
</html>
`;
//# sourceMappingURL=email-layout.js.map