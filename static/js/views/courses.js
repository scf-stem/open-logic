document.addEventListener('DOMContentLoaded', () => {
    const trackBtns = document.querySelectorAll('.track-btn');
    const sgGraph = document.getElementById('pathway-graph');
    
    // Fetch Course Data from Backend
    async function loadCourseGraph() {
        try {
            const response = await fetch('/api/courses/graph');
            if (!response.ok) throw new Error('Network error');
            const result = await response.json();
            
            // Generate visual graph HTML from flat array of lessons
            const courseData = {};
            for (const [track, nodes] of Object.entries(result.data)) {
                let html = '';
                let top = 10;
                let left = 10;
                
                nodes.forEach((node, index) => {
                    // Check if it's the active node (e.g., node map progress logic)
                    // For now, simulate first few as completed, one as active, rest as pending
                    let stateClass = '';
                    let icon = '○';
                    if (index < 2) {
                        stateClass = 'completed';
                        icon = '✓';
                    } else if (index === 2) {
                        stateClass = 'active-node';
                        icon = '⭐';
                    } else if (index > 4) {
                        icon = '🔒';
                    }
                    
                    html += `<div class="path-node ${stateClass}" style="top: ${top}%; left: ${left}%; font-size: 0.9rem; padding: 10px;">${node} ${icon}</div>`;
                    
                    if (index < nodes.length - 1) {
                        // Edge logic
                        const edgeClass = (index < 2) ? 'completed-edge' : '';
                        html += `<div class="path-edge ${edgeClass}" style="top: ${top + 5}%; left: ${left + 15}%; width: 40px;"></div>`;
                    }
                    
                    // Simple snake layout wrap calculation
                    left += 25;
                    if (left > 70) {
                        left = 10;
                        top += 20;
                    }
                });
                courseData[track] = html;
            }
            return courseData;
        } catch (e) {
            console.error("Failed to load course graph data:", e);
            return null; // Handle UI fallback if necessary
        }
    }
    
    // Store promise of data fetching
    const courseDataPromise = loadCourseGraph();


    const drawerData = {
        'python': {
            title: '迭代器与惰性求值',
            badge: '进度 3/3 ✓',
            target: '理解内存效率与计算延迟的权衡',
            metrics: '<span>预计: 45分钟</span><span>实际: 38分钟</span><span class="highlight">效率: A</span>',
            exercises: `
                <li class="completed"><span>基础 · 文件读取器内存对比</span> <span>12m ✓</span></li>
                <li class="completed"><span>进阶 · 自定义Range类实现</span> <span>18m ✓</span></li>
                <li class="completed"><span>挑战 · 10GB日志生成器管道</span> <span>8m ✓</span></li>
            `,
            concepts: `
                <span class="tag">list_comprehension</span>
                <span class="tag">generator</span>
                <span class="tag">lazy_eval</span>
            `
        },
        'c': {
            title: '虚拟内存与页表机制',
            badge: '进度 1/3 ⏳',
            target: '掌握底层内存映射、mmap调用与缺页中断机制',
            metrics: '<span>预计: 60分钟</span><span>实际: 15分钟</span><span class="highlight">效率: 待定</span>',
            exercises: `
                <li class="completed"><span>基础 · 栈地址ASLR观察</span> <span>15m ✓</span></li>
                <li><span>进阶 · mmap共享内存实现</span> <span>未开始</span></li>
                <li><span style="color:#A3B8CC">挑战 · 简易内存分配器 [锁定]</span> <span>--</span></li>
            `,
            concepts: `
                <span class="tag">address_space</span>
                <span class="tag">mmap</span>
                <span class="tag">page_fault</span>
            `
        },
        'vibe': {
            title: '代码审查与责任归因',
            badge: '进度 0/2 ⏳',
            target: '在AI协作流中，建立严苛的代码质疑与所有权划分能力',
            metrics: '<span>预计: 30分钟</span><span>实际: 0分钟</span><span class="highlight">效率: 待定</span>',
            exercises: `
                <li><span>理论 · 归因追踪矩阵设计</span> <span>未开始</span></li>
                <li><span>工坊 · 并发Bug人机排查</span> <span>未开始</span></li>
            `,
            concepts: `
                <span class="tag">code_ownership</span>
                <span class="tag">critical_review</span>
                <span class="tag">traceability</span>
            `
        }
    };

    // DOM Elements for drawer updates
    const titleEl = document.querySelector('.scf-drawer h3');
    const badgeEl = document.querySelector('.scf-drawer .badge-completed');
    const targetEl = document.querySelector('.scf-drawer .drawer-body p');
    const metricsEl = document.querySelector('.scf-drawer .mini-metrics');
    const exerciseListEl = document.querySelector('.scf-drawer .exercise-list');
    const conceptsEl = document.querySelector('.scf-drawer .concept-tags');

    trackBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            // Update active state
            document.querySelector('.track-btn.active').classList.remove('active');
            btn.classList.add('active');
            
            const track = btn.dataset.track;
            
            // Wait for course data to be ready
            const loadedCourseData = await courseDataPromise;
            
            // Switch Map visualization
            sgGraph.style.opacity = '0';
            setTimeout(() => {
                if (loadedCourseData && loadedCourseData[track]) {
                    sgGraph.innerHTML = loadedCourseData[track];
                } else {
                    sgGraph.innerHTML = '<div style="text-align:center; padding-top:20%; color:#6C5CE7;">Loading error or no data</div>';
                }
                sgGraph.style.opacity = '1';
                
                // Update Drawer Data Content
                const dData = drawerData[track];
                titleEl.textContent = dData.title;
                badgeEl.textContent = dData.badge;
                
                if(dData.badge.includes('✓')) {
                    badgeEl.style.background = '#E6F9F5';
                    badgeEl.style.color = '#00A884';
                } else {
                    badgeEl.style.background = '#EEF2F6';
                    badgeEl.style.color = '#0A2540';
                }
                
                targetEl.innerHTML = `<strong>教学目标：</strong> ${dData.target}`;
                metricsEl.innerHTML = dData.metrics;
                exerciseListEl.innerHTML = dData.exercises;
                conceptsEl.innerHTML = dData.concepts;

            }, 200);
        });
    });

    // Trigger initial load for the first active button (default is Python)
    const initialTrackBtn = document.querySelector('.track-btn.active');
    if (initialTrackBtn) {
        initialTrackBtn.click();
    }
});
