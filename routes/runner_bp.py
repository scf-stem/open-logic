from flask import Blueprint, request, jsonify
from services.sandbox import execute_python, execute_c
import uuid
import time

runner_bp = Blueprint('runner_bp', __name__)

@runner_bp.route('/api/run', methods=['POST'])
@runner_bp.route('/runner/execute', methods=['POST']) # Support both legacy and new Enterprise proxy path
def run_code():
    data = request.get_json()
    if not data or 'code' not in data or 'language' not in data:
        return jsonify({'error': 'Missing code or language parameters'}), 400
        
    code = data['code']
    language = data['language'].lower()
    
    # Base Enterprise Payload Structure
    response_payload = {
        "requestId": f"osi-{int(time.time())}-{str(uuid.uuid4())[:6]}",
        "module": "enterprise_code_runner",
        "context": data.get("context", {
            "source": "api_direct",
            "entryMethod": "execution_panel"
        }),
        "execution": {},
        "analysis": {},
        "integration": {
            "osiSync": {"streakMaintained": True},
            "homepageWidget": {"lastActivity": f"{language}_practice"}
        },
        "telemetry": {
            "eventType": "code_execution_attempt"
        }
    }
    
    if language == 'python':
        sandbox_res = execute_python(code)
    elif language == 'c':
        sandbox_res = execute_c(code)
    else:
        return jsonify({'error': 'Unsupported language. Use python or c.'}), 400
        
    # Map Sandbox constraints/returns to Enterprise Structure
    response_payload["execution"] = sandbox_res.get("execution", {})
    response_payload["execution"]["language"] = language
    
    # Merge nested sandbox mock analysis
    response_payload["analysis"] = sandbox_res.get("analysis", {})
    
    if response_payload["execution"].get("status") == "success":
        response_payload["telemetry"]["eventType"] = "code_execution_success"
    else:
        response_payload["telemetry"]["eventType"] = "code_execution_failed"
        
    return jsonify(response_payload), 200
