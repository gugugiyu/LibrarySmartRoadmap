import os
from app import create_app

# Lấy tên cấu hình từ biến môi trường, mặc định là 'development'
config_name = os.environ.get('FLASK_ENV', 'development')

# Tạo một instance của ứng dụng
app = create_app(config_name)

if __name__ == '__main__':
    # Chạy ứng dụng
    # host='0.0.0.0' để cho phép truy cập từ bên ngoài container (nếu dùng Docker)
    app.run(host='0.0.0.0', port=5000)