import os
import openai
from flask import current_app

class AIService:
    @staticmethod
    def generate_answer(title, content):
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            return "AI 服务未配置 (Missing OPENAI_API_KEY)"

        openai.api_key = api_key
        openai.base_url = os.environ.get('OPENAI_BASE_URL', 'https://api.deepseek.com')
        
        system_prompt = (
            "你是一个友好的少儿编程导师，名叫 '源问AI'。"
            "你的目标是帮助 10-18 岁的青少年解决编程和硬件问题。"
            "回答通过以下原则："
            "1. 语气亲切、鼓励性强，避免居高临下的说教。"
            "2. 解释通俗易懂，尽量用比喻。"
            "3. 如果涉及代码修改，请提供修改后的代码块，并标明注释。"
            "4. 鼓励学生自己思考，不要直接甩出答案而不解释原理。"
        )
        
        user_message = f"标题: {title}\n内容: {content}"

        try:
            response = openai.chat.completions.create(
                model="deepseek-chat", 
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=800
            )
            return response.choices[0].message.content
        except Exception as e:
            current_app.logger.error(f"OpenAI API Error: {str(e)}")
            return "AI 思考过程中遇到了点小问题，请稍后再试或等待人工回复。"

    @staticmethod
    def trigger_ai_reply(app, post_id, context_text):
        """
        Executed in a separate thread.
        Generates an AI response and saves it as a comment.
        """
        from models import User, Comment
        from extensions import db

        with app.app_context():
            # Get AI User (Create if not exists)
            ai_user = User.query.filter_by(username='AI助手').first()
            if not ai_user:
                ai_user = User(username='AI助手')
                ai_user.set_password('system_ai_pwd')
                db.session.add(ai_user)
                db.session.commit()

            # Generate Answer
            answer = AIService.generate_answer("回复用户评论", context_text)
            
            # Save Comment
            comment = Comment(
                content=answer,
                is_ai=True,
                post_id=post_id,
                user_id=ai_user.id
            )
            db.session.add(comment)
            db.session.commit()
