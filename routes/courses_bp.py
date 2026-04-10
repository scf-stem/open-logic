import os
import re
from flask import Blueprint, render_template, jsonify

courses_bp = Blueprint('courses_bp', __name__)

@courses_bp.route('/courses')
def courses_page():
    # Render the SCF style multi-language learning map
    return render_template('courses.html')

@courses_bp.route('/api/courses/graph')
def get_course_graph():
    """
    Reads markdown files from data/lessons and parses H2 headings
    as lessons to populate the course pathway graph.
    """
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'lessons')
    
    tracks = {
        'python': [],
        'c': [],
        'vibe': []
    }
    
    # Simple regex to capture '## 1. Python 简介' -> 'Python 简介'
    h2_pattern = re.compile(r'^##\s+(?:\d+\.\s+)?(.+)$')
    
    if os.path.exists(data_dir):
        for filename in sorted(os.listdir(data_dir)):
            if not filename.endswith('.md'):
                continue
                
            # Determine track from filename, e.g. 01_python_basics.md -> python
            track = None
            if '_python_' in filename:
                track = 'python'
            elif '_c_' in filename:
                track = 'c'
            elif '_vibe_' in filename:
                track = 'vibe'
                
            if track:
                filepath = os.path.join(data_dir, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    for line in f:
                        match = h2_pattern.match(line.strip())
                        if match:
                            tracks[track].append(match.group(1).strip())
                            
    return jsonify({
        'code': 200,
        'data': tracks
    })

@courses_bp.route('/api/courses/lesson/<track>/<int:lesson_id>')
def get_course_lesson(track, lesson_id):
    """
    Returns the markdown content of a specific lesson file.
    lesson_id is 1-indexed.
    """
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'lessons')
    if not os.path.exists(data_dir):
        return jsonify({'code': 404, 'message': 'Course data not found'})
        
    files = [f for f in sorted(os.listdir(data_dir)) if f.endswith('.md') and f'_{track}_' in f]
    
    if lesson_id < 1 or lesson_id > len(files):
        return jsonify({'code': 404, 'message': 'Lesson not found'})
        
    filepath = os.path.join(data_dir, files[lesson_id - 1])
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    return jsonify({
        'code': 200,
        'data': {
            'content': content,
            'total': len(files),
            'current': lesson_id
        }
    })
