<?php
ini_set("error_reporting", 0);
ini_set("short_open_tag", "Off");

set_error_handler(function($_errno, $errstr) {
    echo "Something went wrong!";
});

if(isset($_GET['source'])) {
    highlight_file(__FILE__);
    die();
}

include "flag.php";

$output = null;
if(isset($_POST['input']) && is_scalar($_POST['input'])) {
    $input = $_POST['input'];
    $input = htmlentities($input,  ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $input = addslashes($input);
    $input = addcslashes($input, '+?<>&v=${}%*:.[]_-0123456789xb `;');
    try {
        $input = "readfile(implode(array(chr(102),chr(108),chr(97),chr(103),chr(46),chr(112),chr(104),chr(112))))";
        $output = eval("$input;");
    } catch (Exception $e) {
        // nope, nothing
    }
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Slasher</title>
    <link rel="stylesheet" href="style.css">
    <script>
        function copyResult() {
            const el = document.getElementById('resultText');
            if (!el) return;
            const rng = document.createRange();
            rng.selectNodeContents(el);
            const sel = window.getSelection();
            sel.removeAllRanges(); sel.addRange(rng);
            try { document.execCommand('copy'); } catch(e){}
            sel.removeAllRanges();
            const btn = document.getElementById('copyBtn');
            if(btn){
                const original = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(()=>btn.textContent=original, 1200);
            }
        }
    </script>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="brand">
                <div class="logo" aria-hidden="true"></div>
                <h1>Slasher</h1>
            </div>
            <nav class="actions">
                <a class="kbd" href="/?source" title="View source">view source</a>
            </nav>
        </header>

        <section class="card">
            <div class="head">
                <strong>Eval your slashes</strong>
                <span class="kbd">POST</span>
            </div>
            <div class="body">
                <form action="/" method="post" autocomplete="off" spellcheck="false">
                    <label for="input">Input your content</label>
                    <div class="input-row">
                        <input id="input" name="input" type="text" placeholder='e.g. "1+2"' />
                        <button class="btn" type="submit">Submit</button>
                    </div>
                </form>

                <?php if($output) { ?>
                    <div class="result-title">Your result is:</div>
                    <div class="result" id="resultText"><?php echo htmlentities($output); ?></div>
                    <div class="actions" style="margin-top:10px">
                        <button id="copyBtn" class="btn btn-secondary" type="button" onclick="copyResult()">Copy result</button>
                    </div>
                <?php } ?>

                <p class="notice">
                    To view the source code, <a href="/?source">click here</a>.
                </p>
            </div>
        </section>

        <footer class="footer">
            <span>© <?php echo date('Y'); ?> gehaxelt. Made with <3 and AI</span>
        </footer>
    </div>
</body>
</html>
