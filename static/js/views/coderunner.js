document.addEventListener('DOMContentLoaded', () => {
    const t = (key, fallback, vars) => window.appT(key, fallback, vars);
    const modal = document.getElementById('scf-code-runner-modal');
    const closeBtn = document.getElementById('close-runner-modal');
    const runBtn = document.getElementById('run-code-btn');
    const langSelect = document.getElementById('code-runner-lang');
    const editor = document.getElementById('code-editor');
    const terminal = document.getElementById('terminal-output');
    
    const diagContainer = document.getElementById('diagnosis-container');
    const diagLayer1 = document.getElementById('diag-layer-1');
    const diagLayer2 = document.getElementById('diag-layer-2');
    const diagLayer3 = document.getElementById('diag-layer-3');
    const metricsBar = document.getElementById('metrics-bar');

    // Default templates based on language selection
    const templates = {
        'python': 'def squares(n):\n    return [i**2 for i in range(n) if i % 2 == 0]\n\nprint(squares(5))',
        'c': '#include <stdio.h>\n\nint* dangling() {\n    int local = 42;\n    return &local;\n}\n\nint main() {\n    int *p = dangling();\n    printf("%d\\n", *p);\n    return 0;\n}'
    };

    // Initialize Editor
    editor.value = templates[langSelect.value];

    langSelect.addEventListener('change', (e) => {
        editor.value = templates[e.target.value];
        clearTerminal();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close when clicking outside modal
    modal.addEventListener('click', (e) => {
        if(e.target === modal) {
            modal.style.display = 'none';
        }
    });

    function clearTerminal() {
        terminal.innerHTML = `<div class="terminal-placeholder">${t('coderunner.ready')}</div>`;
        diagContainer.classList.add('hidden');
        metricsBar.classList.add('hidden');
    }

    runBtn.addEventListener('click', async () => {
        const code = editor.value;
        const lang = langSelect.value;
        
        runBtn.disabled = true;
        runBtn.textContent = t('courses.running');
        clearTerminal();
        terminal.innerHTML = t('coderunner.compiling');

        try {
            const response = await fetch('/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language: lang })
            });
            
            const result = await response.json();
            renderResult(result);
        } catch (err) {
            terminal.innerHTML = `<span class="error">${t('coderunner.network_error', '', { message: err.message })}</span>`;
        } finally {
            runBtn.disabled = false;
            runBtn.textContent = `▶ ${t('coderunner.run')}`;
        }
    });

    function renderResult(result) {
        terminal.innerHTML = '';
        if (result.error) {
            terminal.innerHTML = `<span class="error">${result.error}</span>`;
            return;
        }

        const { execution = {}, analysis = {}, metrics = {} } = result;

        // 1. Render Terminal Output
        if (execution.stdout) {
            const outDiv = document.createElement('div');
            outDiv.textContent = execution.stdout;
            terminal.appendChild(outDiv);
        }
        if (execution.stderr) {
            const errDiv = document.createElement('div');
            errDiv.className = 'error';
            errDiv.textContent = execution.stderr;
            terminal.appendChild(errDiv);
        }
        
        if (execution.status === 'success') {
            const statusDiv = document.createElement('div');
            statusDiv.className = 'success';
            statusDiv.textContent = `\\n${t('coderunner.program_success')}`;
            terminal.appendChild(statusDiv);
        } else if (execution.exit_code !== undefined) {
            const statusDiv = document.createElement('div');
            statusDiv.className = 'error';
            statusDiv.textContent = `\\n${t('coderunner.program_failed', '', { code: execution.exit_code })}`;
            terminal.appendChild(statusDiv);
        }

        // 2. Render SCF Diagnostics
        if (analysis.correctness === false && analysis.diagnosis) {
            diagContainer.classList.remove('hidden');
            const diag = analysis.diagnosis;
            
            // Layer 1
            if (diag.layer_1_instant) {
                diagLayer1.innerHTML = `<strong>${diag.layer_1_instant.headline}</strong>: ${diag.layer_1_instant.one_liner || ''}`;
                diagLayer1.classList.remove('hidden');
            } else {
                diagLayer1.classList.add('hidden');
            }

            // Layer 2
            if (diag.layer_2_deep) {
                diagLayer2.innerHTML = `<strong>${t('coderunner.deep_analysis', '', { category: diag.layer_2_deep.error_category })}</strong>: ${t('coderunner.deep_analysis_copy')}`;
                diagLayer2.classList.remove('hidden');
            } else {
                diagLayer2.classList.add('hidden');
            }

            // Layer 3
            if (diag.layer_3_resources) {
                diagLayer3.innerHTML = `<strong>${t('coderunner.fix_suggestion')}</strong>: ${t('coderunner.fix_suggestion_copy')}`;
                diagLayer3.classList.remove('hidden');
            } else {
                diagLayer3.classList.add('hidden');
            }
        } else if (analysis.suggestion) {
            diagContainer.classList.remove('hidden');
            diagLayer1.innerHTML = `<strong>${t('coderunner.smart_hint')}</strong>: ${analysis.suggestion.message}`;
            diagLayer1.classList.add('success');
            diagLayer1.classList.remove('hidden');
            diagLayer2.classList.add('hidden');
            diagLayer3.classList.add('hidden');
        } else {
            diagContainer.classList.add('hidden');
        }

        // 3. Render Metrics
        if (Object.keys(metrics).length > 0) {
            metricsBar.classList.remove('hidden');
            metricsBar.innerHTML = '';
            if (metrics.time_ms !== undefined) {
                 metricsBar.innerHTML += `<span>${t('coderunner.time_ms', '', { value: metrics.time_ms })}</span>`;
            }
            if (metrics.compile_ms !== undefined) {
                 metricsBar.innerHTML += `<span>${t('coderunner.compile_ms', '', { value: metrics.compile_ms })}</span>`;
            }
            if (metrics.memory_kb !== undefined) {
                 metricsBar.innerHTML += `<span>${t('coderunner.memory_kb', '', { value: metrics.memory_kb })}</span>`;
            }
        } else {
            metricsBar.classList.add('hidden');
        }
    }
});
