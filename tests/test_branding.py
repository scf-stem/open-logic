import unittest
import os

os.environ.setdefault("FLASK_CONFIG", "development")
os.environ.setdefault("SECRET_KEY", "test-secret")

from app import create_app
from config import DevelopmentConfig
from translations import TRANSLATIONS


class BrandingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app(DevelopmentConfig)
        cls.client = cls.app.test_client()

    def test_nav_and_page_branding_render_open_logic(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        body = response.get_data(as_text=True)
        self.assertIn("Open Logic", body)
        self.assertIn("OL", body)

    def test_translation_brand_strings_are_renamed(self):
        self.assertEqual(TRANSLATIONS["en"]["footer.title1"], "Open Logic")
        self.assertEqual(TRANSLATIONS["zh"]["footer.title1"], "Open Logic 源问")
        self.assertEqual(TRANSLATIONS["en"]["about.eyebrow"], "About Open Logic")
        self.assertEqual(TRANSLATIONS["zh"]["about.eyebrow"], "About Open Logic")


if __name__ == "__main__":
    unittest.main()
