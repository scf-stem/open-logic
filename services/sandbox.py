import os
import subprocess
import tempfile
import time
import json
import resource
import shutil

# SCF Sandbox constraints
MAX_MEMORY_KB = 256 * 1024 # 256MB
MAX_CPU_TIME_SECONDS = 2
MAX_WALL_TIME_SECONDS = 3

def limit_resources():
    """Set resource limits for child processes using resource.setrlimit"""
    try:
        # Limit CPU time
        resource.setrlimit(resource.RLIMIT_CPU, (MAX_CPU_TIME_SECONDS, MAX_CPU_TIME_SECONDS + 1))
        # Limit Memory (AS=Address Space, DATA=Data Segment)
        mem_limit_bytes = MAX_MEMORY_KB * 1024
        resource.setrlimit(resource.RLIMIT_AS, (mem_limit_bytes, mem_limit_bytes))
        # Optional: restrict creating new files (fsize=0) to prevent disk fill, but let's allow small if needed
        resource.setrlimit(resource.RLIMIT_FSIZE, (1024*1024, 1024*1024))
    except (ValueError, OSError):
        pass # Ignore errors on platforms where this is not supported (e.g., Windows)

class SandboxException(Exception):
    pass

def execute_python(code: str):
    """Execute Python code in an isolated environment."""
    start_time = time.time()
    result = {
        "module": "code_runner",
        "entry_point": "homepage_quick_start",
        "ui_pattern": "scf_modal_overlay",
        "execution": {},
        "metrics": {"time_ms": 0, "memory_kb": 0, "cpu_percent": 0},
        "analysis": {},
        "homepage_sync": {},
        "xapi_statement": {}
    }
    
    with tempfile.TemporaryDirectory() as temp_dir:
        file_path = os.path.join(temp_dir, 'main.py')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code)
            
        try:
            # We use subprocess with resource limits applied via preexec_fn
            process = subprocess.Popen(
                ['python3', file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=limit_resources,
                cwd=temp_dir,
                text=True
            )
            
            try:
                stdout, stderr = process.communicate(timeout=MAX_WALL_TIME_SECONDS)
                end_time = time.time()
                exit_code = process.returncode
                
                result["execution"] = {
                    "status": "success" if exit_code == 0 else "error",
                    "stdout": stdout,
                    "stderr": stderr,
                    "exit_code": exit_code
                }
                
                # Mock analysis (Can be replaced with LLM AST analysis later)
                result["analysis"] = {
                    "correctness": exit_code == 0,
                    "style_score": 8.5,
                    "scf_quality_gate": "passed" if exit_code == 0 else "failed",
                    "suggestion": {
                        "level": "optimization",
                        "message": "代码运行成功，请留意时间复杂度",
                    } if exit_code == 0 else {
                        "level": "error",
                        "message": "执行期间发生错误"
                    }
                }
                
            except subprocess.TimeoutExpired:
                process.kill()
                stdout, stderr = process.communicate()
                end_time = time.time()
                result["execution"] = {
                    "status": "timeout",
                    "error_phase": "runtime",
                    "stdout": stdout,
                    "stderr": "==ERROR: CPU Time / Wall Time exceeded (Simulation of SCF limit)",
                    "exit_code": 137
                }
                result["analysis"] = {
                    "correctness": False,
                    "scf_quality_gate": "failed",
                    "suggestion": {"level": "error", "message": "执行超时"}
                }
                
        except Exception as e:
            end_time = time.time()
            result["execution"] = {
                "status": "error",
                "stderr": str(e),
                "exit_code": -1
            }
            
        result["metrics"]["time_ms"] = int((end_time - start_time) * 1000)
        # Mock memory metric for API response
        result["metrics"]["memory_kb"] = 1204 if result["execution"]["status"] == "success" else 0
        
    return result


def execute_c(code: str):
    """Execute C code in an isolated environment with robust compilation flags."""
    start_time = time.time()
    result = {
        "module": "code_runner",
        "entry_point": "homepage_quick_start",
        "ui_pattern": "scf_debugger_overlay",
        "execution": {},
        "metrics": {"compile_ms": 0, "run_ms": 0},
        "analysis": {},
        "homepage_sync": {},
        "xapi_statement": {}
    }
    
    with tempfile.TemporaryDirectory() as temp_dir:
        source_path = os.path.join(temp_dir, 'main.c')
        exec_path = os.path.join(temp_dir, 'a.out')
        
        with open(source_path, 'w', encoding='utf-8') as f:
            f.write(code)
            
        # Compile Step with SCF Security Flags
        compile_start = time.time()
        compile_cmd = [
            'gcc', source_path, '-o', exec_path,
            '-fstack-protector-strong', '-fPIE', '-pie',
            '-fsanitize=address,undefined', '-O1', '-g'
        ]
        
        try:
            compile_proc = subprocess.run(compile_cmd, capture_output=True, text=True, timeout=5)
            compile_ms = int((time.time() - compile_start) * 1000)
            result["metrics"]["compile_ms"] = compile_ms
            
            if compile_proc.returncode != 0:
                result["execution"] = {
                    "status": "error",
                    "error_phase": "compile",
                    "stdout": "",
                    "stderr": compile_proc.stderr,
                    "exit_code": compile_proc.returncode
                }
                result["analysis"] = {
                    "correctness": False,
                    "scf_quality_gate": "failed",
                    "diagnosis": {
                        "layer_1_instant": {
                            "alert_type": "compile_error",
                            "headline": "编译失败",
                        }
                    }
                }
                return result
                
        except Exception as e:
            result["execution"] = {
                "status": "error",
                "error_phase": "compile",
                "stderr": str(e),
                "exit_code": -1
            }
            return result
            
        # Run Step
        run_start = time.time()
        try:
            # Note: macOS ASan may require setting ASAN_OPTIONS or DYLD_INSERT_LIBRARIES
            # We add ASAN_OPTIONS to allow slightly better output format
            env = dict(os.environ)
            env['ASAN_OPTIONS'] = 'color=always'
            
            process = subprocess.Popen(
                [exec_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=limit_resources,
                cwd=temp_dir,
                env=env,
                text=True
            )
            
            try:
                stdout, stderr = process.communicate(timeout=MAX_WALL_TIME_SECONDS)
                run_time_ms = int((time.time() - run_start) * 1000)
                exit_code = process.returncode
                
                result["metrics"]["run_ms"] = run_time_ms
                
                if "AddressSanitizer" in stderr or "UndefinedBehaviorSanitizer" in stderr or exit_code != 0:
                    result["execution"] = {
                        "status": "error",
                        "error_phase": "runtime",
                        "stdout": stdout,
                        "stderr": stderr,
                        "exit_code": exit_code
                    }
                    result["analysis"] = {
                        "correctness": False,
                        "scf_quality_gate": "failed",
                        "diagnosis": {
                            "layer_1_instant": {
                                "alert_type": "memory_safety" if "AddressSanitizer" in stderr else "runtime_error",
                                "icon": "scf-icon-shield-alert",
                                "headline": "检测到内存违规或未定义行为" if "Sanitizer" in stderr else "运行时崩溃",
                                "one_liner": "程序执行异常中断"
                            },
                            "layer_2_deep": {
                                "error_category": "undefined_behavior" if "Sanitizer" in stderr else "crash"
                            }
                        }
                    }
                    # Example 2 simulation flag
                    if "stack-use-after-return" in stderr or "stack-use-after-scope" in stderr:
                        result["metrics"]["asan_detected"] = True
                else:
                    result["execution"] = {
                        "status": "success",
                        "stdout": stdout,
                        "stderr": stderr,
                        "exit_code": exit_code
                    }
                    result["analysis"] = {
                        "correctness": True,
                        "scf_quality_gate": "passed"
                    }
                
            except subprocess.TimeoutExpired:
                process.kill()
                stdout, stderr = process.communicate()
                result["execution"] = {
                    "status": "timeout",
                    "error_phase": "runtime",
                    "stdout": stdout,
                    "stderr": "==ERROR: Timeout expired",
                    "exit_code": 137
                }
                
        except Exception as e:
            result["execution"] = {
                "status": "error",
                "error_phase": "runtime",
                "stderr": str(e),
                "exit_code": -1
            }
            
    return result
