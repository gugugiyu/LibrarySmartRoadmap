from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Khởi tạo đối tượng DB
db = SQLAlchemy()

# Khởi tạo đối tượng Migrate
migrate = Migrate()