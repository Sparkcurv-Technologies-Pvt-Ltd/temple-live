"""Generate a comprehensive Setup Guide PDF for the Temple Management System.

Covers:
  A. Local development setup on Ubuntu 24.04
  B. Production deployment on AWS EC2 (Ubuntu 26.04) with Nginx
  C. Full frontend and backend .env files
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, black
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, PageBreak, Table,
    TableStyle, KeepTogether,
)


PRIMARY = HexColor("#8B0000")
ACCENT = HexColor("#B8860B")
CODE_BG = HexColor("#f4f4f4")
BORDER = HexColor("#dddddd")


def make_styles():
    ss = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle(
            "TitleStyle", parent=ss["Title"], fontName="Helvetica-Bold",
            fontSize=22, textColor=PRIMARY, alignment=TA_LEFT,
            spaceAfter=6, leading=26,
        ),
        "subtitle": ParagraphStyle(
            "SubTitleStyle", parent=ss["Heading2"], fontName="Helvetica",
            fontSize=12, textColor=HexColor("#555555"), alignment=TA_LEFT,
            spaceAfter=14,
        ),
        "h1": ParagraphStyle(
            "H1", parent=ss["Heading1"], fontName="Helvetica-Bold",
            fontSize=18, textColor=PRIMARY, spaceBefore=8, spaceAfter=10,
            leading=22,
        ),
        "h2": ParagraphStyle(
            "H2", parent=ss["Heading2"], fontName="Helvetica-Bold",
            fontSize=14, textColor=HexColor("#333333"), spaceBefore=10, spaceAfter=6,
            leading=18,
        ),
        "h3": ParagraphStyle(
            "H3", parent=ss["Heading3"], fontName="Helvetica-Bold",
            fontSize=12, textColor=ACCENT, spaceBefore=8, spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "Body", parent=ss["BodyText"], fontName="Helvetica",
            fontSize=10.5, leading=15, spaceAfter=6,
        ),
        "note": ParagraphStyle(
            "Note", parent=ss["BodyText"], fontName="Helvetica-Oblique",
            fontSize=10, leading=14, textColor=HexColor("#555555"),
            leftIndent=10, rightIndent=10, spaceAfter=6,
            backColor=HexColor("#fff9e6"), borderColor=ACCENT,
            borderWidth=0.5, borderPadding=6,
        ),
        "code": ParagraphStyle(
            "Code", parent=ss["Code"], fontName="Courier",
            fontSize=9, leading=12, backColor=CODE_BG,
            borderColor=BORDER, borderWidth=0.5, borderPadding=6,
            leftIndent=6, rightIndent=6, spaceBefore=4, spaceAfter=8,
        ),
    }
    return styles


def code(text, s):
    return Preformatted(text, s["code"])


def note(text, s):
    return Paragraph(f"<b>Note:</b> {text}", s["note"])


def h1(t, s): return Paragraph(t, s["h1"])
def h2(t, s): return Paragraph(t, s["h2"])
def h3(t, s): return Paragraph(t, s["h3"])
def p(t, s):  return Paragraph(t, s["body"])


def build(out_path):
    doc = SimpleDocTemplate(
        out_path, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=1.6 * cm, bottomMargin=1.6 * cm,
        title="Temple Management System - Setup Guide",
        author="Emergent",
    )

    s = make_styles()
    story = []

    # ============  COVER  ============
    story.append(Paragraph("Temple Management System", s["title"]))
    story.append(Paragraph("Complete Setup Guide", s["subtitle"]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(p(
        "This document covers the full local development setup on "
        "<b>Ubuntu 24.04 LTS</b> and the production deployment on "
        "<b>AWS EC2 (Ubuntu 26.04)</b> with the <b>Nginx</b> web server.",
        s,
    ))
    story.append(Spacer(1, 0.3 * cm))
    story.append(p(
        "Tech stack:<br/>"
        "&nbsp;&nbsp;&bull; Backend&nbsp;— Django 4.2 + Django REST Framework + uvicorn (ASGI)<br/>"
        "&nbsp;&nbsp;&bull; Frontend — React 18 + Vite (built as a static bundle)<br/>"
        "&nbsp;&nbsp;&bull; Database — MySQL 8 / MariaDB 10<br/>"
        "&nbsp;&nbsp;&bull; Web server — Nginx (reverse proxy)<br/>"
        "&nbsp;&nbsp;&bull; Process manager — systemd (or supervisor)",
        s,
    ))
    story.append(Spacer(1, 0.4 * cm))

    tbl_data = [
        ["Section", "Topic"],
        ["A", "Local Development Setup — Ubuntu 24.04"],
        ["B", "Production Deployment on AWS EC2 — Ubuntu 26.04 + Nginx"],
        ["C", "Environment Files — frontend/.env and backend/.env"],
        ["D", "Post-Install Checklist and Common Issues"],
    ]
    t = Table(tbl_data, colWidths=[2 * cm, 14 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [HexColor("#ffffff"), HexColor("#fafafa")]),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ============  SECTION A — LOCAL UBUNTU 24  ============
    story.append(h1("A. Local Development Setup — Ubuntu 24.04", s))
    story.append(p(
        "This section walks you through setting up the entire stack on "
        "a fresh Ubuntu 24.04 laptop or VM for local development and "
        "testing. Estimated time: 15 minutes on a decent internet connection.",
        s,
    ))

    story.append(h2("A.1 Install system dependencies", s))
    story.append(p(
        "Open a terminal and run the following in one shot. It installs "
        "Python, Node.js (via NodeSource), Yarn, MariaDB and the "
        "development headers required for <code>mysqlclient</code>.",
        s,
    ))
    story.append(code(
        "sudo apt update && sudo apt upgrade -y\n"
        "sudo apt install -y \\\n"
        "    build-essential pkg-config git curl unzip \\\n"
        "    python3 python3-venv python3-pip python3-dev \\\n"
        "    default-mysql-server default-libmysqlclient-dev \\\n"
        "    nginx\n\n"
        "# Node.js 20 LTS via NodeSource\n"
        "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\n"
        "sudo apt install -y nodejs\n\n"
        "# Yarn (via npm — most reliable across Ubuntu versions)\n"
        "sudo npm install -g yarn",
        s,
    ))

    story.append(h2("A.2 Start MariaDB and create the database", s))
    story.append(code(
        "sudo systemctl enable --now mariadb\n"
        "sudo mysql_secure_installation   # follow prompts, set a root password\n\n"
        "# Create the database, user, and grant permissions\n"
        "sudo mysql <<'SQL'\n"
        "CREATE DATABASE temple CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;\n"
        "CREATE USER 'appadmin'@'localhost' IDENTIFIED BY 'CHANGE_ME_STRONG';\n"
        "GRANT ALL PRIVILEGES ON temple.* TO 'appadmin'@'localhost';\n"
        "FLUSH PRIVILEGES;\n"
        "SQL",
        s,
    ))
    story.append(note(
        "If you already have a SQL dump (temple_db.sql), import it now:<br/>"
        "<font face='Courier'>mysql -u appadmin -p temple &lt; temple_db.sql</font><br/>"
        "If the dump was created on MySQL 8, replace <font face='Courier'>"
        "utf8mb4_0900_ai_ci</font> with <font face='Courier'>utf8mb4_general_ci"
        "</font> before importing (MariaDB compatibility):<br/>"
        "<font face='Courier'>sed -i 's/utf8mb4_0900_ai_ci/utf8mb4_general_ci/g' temple_db.sql</font>",
        s,
    ))

    story.append(h2("A.3 Clone and configure the project", s))
    story.append(code(
        "cd ~ && git clone <YOUR_REPO_URL> temple\n"
        "cd temple\n\n"
        "# Create the two env files (contents in Section C)\n"
        "nano backend/.env\n"
        "nano frontend/.env",
        s,
    ))

    story.append(h2("A.4 Backend — Python virtual environment", s))
    story.append(code(
        "cd ~/temple/backend\n"
        "python3 -m venv venv\n"
        "source venv/bin/activate\n"
        "pip install --upgrade pip wheel\n"
        "pip install -r requirements.txt\n\n"
        "# Migrate (creates tables — safe to run even after a SQL import,\n"
        "# it will only apply any missing migrations)\n"
        "python manage.py migrate\n"
        "python manage.py collectstatic --noinput\n\n"
        "# Create your admin superuser\n"
        "python manage.py createsuperuser",
        s,
    ))

    story.append(h2("A.5 Frontend — install and run", s))
    story.append(code(
        "cd ~/temple/frontend\n"
        "yarn install\n\n"
        "# Dev server with hot reload\n"
        "yarn dev            # http://localhost:3000\n\n"
        "# OR build a static bundle for production-like preview\n"
        "yarn build && yarn add -D http-server && \\\n"
        "  npx http-server dist -p 3000 -a 0.0.0.0 \\\n"
        "  -P http://localhost:3000?",
        s,
    ))

    story.append(h2("A.6 Run the backend", s))
    story.append(code(
        "cd ~/temple/backend && source venv/bin/activate\n"
        "uvicorn temple_proj.asgi:application --host 0.0.0.0 --port 8000 --reload",
        s,
    ))
    story.append(p(
        "Open <b>http://localhost:3000</b> in your browser. Sign in with the "
        "superuser account you created in step A.4. If you see the sidebar and "
        "the Home page, you are done.",
        s,
    ))
    story.append(PageBreak())

    # ============  SECTION B — EC2 UBUNTU 26 PRODUCTION  ============
    story.append(h1("B. Production Deployment — AWS EC2, Ubuntu 26.04 + Nginx", s))

    story.append(h2("B.1 Launch the EC2 instance", s))
    story.append(p(
        "In the AWS console:", s,
    ))
    story.append(p(
        "&nbsp;&nbsp;1. <b>AMI</b>: Ubuntu Server 26.04 LTS (arm64 or x86_64).<br/>"
        "&nbsp;&nbsp;2. <b>Instance type</b>: <font face='Courier'>t3.small</font> minimum "
        "(2 GB RAM). For &gt; 500 members use <font face='Courier'>t3.medium</font>.<br/>"
        "&nbsp;&nbsp;3. <b>Storage</b>: 20 GB gp3 (raise later if uploads grow).<br/>"
        "&nbsp;&nbsp;4. <b>Security group</b>: allow inbound "
        "<font face='Courier'>22/tcp</font> from your IP, "
        "<font face='Courier'>80/tcp</font> and "
        "<font face='Courier'>443/tcp</font> from anywhere (0.0.0.0/0).<br/>"
        "&nbsp;&nbsp;5. <b>Key pair</b>: create or reuse one — save the .pem file.<br/>"
        "&nbsp;&nbsp;6. <b>Elastic IP</b>: allocate and associate so the public "
        "IP does not change on stop/start.",
        s,
    ))

    story.append(h2("B.2 First-time server setup", s))
    story.append(code(
        "ssh -i temple.pem ubuntu@<ELASTIC_IP>\n\n"
        "sudo apt update && sudo apt upgrade -y\n"
        "sudo timedatectl set-timezone Asia/Kolkata\n"
        "sudo apt install -y \\\n"
        "    build-essential pkg-config git curl unzip ufw \\\n"
        "    python3 python3-venv python3-pip python3-dev \\\n"
        "    mysql-server default-libmysqlclient-dev \\\n"
        "    nginx certbot python3-certbot-nginx\n\n"
        "# Node.js 20 LTS\n"
        "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\n"
        "sudo apt install -y nodejs && sudo npm i -g yarn\n\n"
        "# Firewall\n"
        "sudo ufw allow OpenSSH\n"
        "sudo ufw allow 'Nginx Full'\n"
        "sudo ufw --force enable",
        s,
    ))

    story.append(h2("B.3 MySQL setup", s))
    story.append(code(
        "sudo systemctl enable --now mysql\n"
        "sudo mysql_secure_installation\n\n"
        "sudo mysql <<'SQL'\n"
        "CREATE DATABASE temple CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;\n"
        "CREATE USER 'appadmin'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_PW';\n"
        "GRANT ALL PRIVILEGES ON temple.* TO 'appadmin'@'localhost';\n"
        "FLUSH PRIVILEGES;\n"
        "SQL",
        s,
    ))

    story.append(h2("B.4 Deploy the code", s))
    story.append(code(
        "sudo mkdir -p /opt/temple && sudo chown ubuntu:ubuntu /opt/temple\n"
        "cd /opt/temple\n"
        "git clone <YOUR_REPO_URL> app\n"
        "cd app\n\n"
        "# ---- Backend ----\n"
        "cd backend\n"
        "python3 -m venv venv && source venv/bin/activate\n"
        "pip install --upgrade pip wheel\n"
        "pip install -r requirements.txt gunicorn uvicorn\n"
        "nano .env    # paste the production backend/.env from Section C\n"
        "python manage.py migrate\n"
        "python manage.py collectstatic --noinput\n"
        "python manage.py createsuperuser\n"
        "deactivate\n\n"
        "# ---- Frontend ----\n"
        "cd /opt/temple/app/frontend\n"
        "nano .env    # paste the production frontend/.env from Section C\n"
        "yarn install\n"
        "yarn build   # generates dist/",
        s,
    ))

    story.append(h2("B.5 systemd service for the backend", s))
    story.append(p(
        "Create <font face='Courier'>/etc/systemd/system/temple-backend.service</font>:",
        s,
    ))
    story.append(code(
        "[Unit]\n"
        "Description=Temple Management Django (uvicorn)\n"
        "After=network.target mysql.service\n"
        "Requires=mysql.service\n\n"
        "[Service]\n"
        "User=ubuntu\n"
        "Group=www-data\n"
        "WorkingDirectory=/opt/temple/app/backend\n"
        "EnvironmentFile=/opt/temple/app/backend/.env\n"
        "ExecStart=/opt/temple/app/backend/venv/bin/uvicorn \\\n"
        "          temple_proj.asgi:application \\\n"
        "          --host 127.0.0.1 --port 8000 \\\n"
        "          --workers 3 --proxy-headers \\\n"
        "          --forwarded-allow-ips='*'\n"
        "Restart=always\n"
        "RestartSec=5\n"
        "StandardOutput=append:/var/log/temple/backend.out.log\n"
        "StandardError=append:/var/log/temple/backend.err.log\n\n"
        "[Install]\n"
        "WantedBy=multi-user.target",
        s,
    ))
    story.append(code(
        "sudo mkdir -p /var/log/temple && sudo chown ubuntu:www-data /var/log/temple\n"
        "sudo systemctl daemon-reload\n"
        "sudo systemctl enable --now temple-backend\n"
        "sudo systemctl status temple-backend",
        s,
    ))

    story.append(h2("B.6 Nginx reverse proxy + static frontend", s))
    story.append(p(
        "Create <font face='Courier'>/etc/nginx/sites-available/temple</font>:",
        s,
    ))
    story.append(code(
        "server {\n"
        "    listen 80;\n"
        "    server_name temple.example.com www.temple.example.com;\n\n"
        "    client_max_body_size 25M;   # allow member-photo uploads\n\n"
        "    # ---- Backend API + admin + media ----\n"
        "    location /api/ {\n"
        "        proxy_pass http://127.0.0.1:8000;\n"
        "        proxy_http_version 1.1;\n"
        "        proxy_set_header Host              $host;\n"
        "        proxy_set_header X-Real-IP         $remote_addr;\n"
        "        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;\n"
        "        proxy_set_header X-Forwarded-Proto $scheme;\n"
        "        proxy_set_header Upgrade           $http_upgrade;\n"
        "        proxy_set_header Connection        \"upgrade\";\n"
        "        proxy_read_timeout                 300s;\n"
        "    }\n\n"
        "    location /admin/ {\n"
        "        proxy_pass http://127.0.0.1:8000;\n"
        "        proxy_set_header Host              $host;\n"
        "        proxy_set_header X-Real-IP         $remote_addr;\n"
        "        proxy_set_header X-Forwarded-Proto $scheme;\n"
        "    }\n\n"
        "    location /static/ {\n"
        "        alias /opt/temple/app/backend/staticfiles/;\n"
        "        access_log off; expires 30d;\n"
        "    }\n\n"
        "    # ---- Frontend static bundle (Vite build) ----\n"
        "    location / {\n"
        "        root /opt/temple/app/frontend/dist;\n"
        "        index index.html;\n"
        "        try_files $uri $uri/ /index.html;   # SPA fallback\n"
        "        add_header Cache-Control \"public, max-age=3600\";\n"
        "    }\n\n"
        "    # Gzip\n"
        "    gzip on;\n"
        "    gzip_types text/plain text/css application/json application/javascript\n"
        "               application/xml image/svg+xml;\n"
        "    gzip_min_length 1024;\n"
        "}",
        s,
    ))
    story.append(code(
        "sudo ln -sf /etc/nginx/sites-available/temple /etc/nginx/sites-enabled/temple\n"
        "sudo rm -f /etc/nginx/sites-enabled/default\n"
        "sudo nginx -t && sudo systemctl reload nginx",
        s,
    ))

    story.append(h2("B.7 HTTPS with Let's Encrypt (free)", s))
    story.append(code(
        "sudo certbot --nginx -d temple.example.com -d www.temple.example.com \\\n"
        "    --agree-tos -m admin@example.com --redirect --non-interactive\n\n"
        "# Auto-renewal is already scheduled by the certbot package.\n"
        "# Verify:\n"
        "sudo systemctl status certbot.timer",
        s,
    ))

    story.append(h2("B.8 Database import (from a dump)", s))
    story.append(code(
        "# From your local machine:\n"
        "scp -i temple.pem temple_db.sql ubuntu@<ELASTIC_IP>:/home/ubuntu/\n\n"
        "# On the EC2 instance:\n"
        "sed -i 's/utf8mb4_0900_ai_ci/utf8mb4_general_ci/g' ~/temple_db.sql\n"
        "mysql -u appadmin -p temple < ~/temple_db.sql\n"
        "rm ~/temple_db.sql   # tidy up",
        s,
    ))

    story.append(h2("B.9 Copy the media/ folder", s))
    story.append(p(
        "Uploaded member photos, documents, festival images, etc. live under "
        "<font face='Courier'>backend/temple_proj/media/</font>. Copy from your "
        "old server (or laptop):",
        s,
    ))
    story.append(code(
        "# On your old server / laptop:\n"
        "tar czf media.tgz -C /path/to/old/backend/temple_proj media\n"
        "scp -i temple.pem media.tgz ubuntu@<ELASTIC_IP>:/home/ubuntu/\n\n"
        "# On the EC2 instance:\n"
        "cd /opt/temple/app/backend/temple_proj\n"
        "tar xzf ~/media.tgz\n"
        "sudo chown -R ubuntu:www-data media\n"
        "sudo chmod -R 755 media",
        s,
    ))
    story.append(PageBreak())

    # ============  SECTION C — ENV FILES  ============
    story.append(h1("C. Environment Files", s))

    story.append(h2("C.1  backend/.env", s))
    story.append(p(
        "Save this at <font face='Courier'>/opt/temple/app/backend/.env</font> "
        "(on EC2) or <font face='Courier'>~/temple/backend/.env</font> (local). "
        "Never commit this file to Git.",
        s,
    ))
    story.append(code(
        "# ==== Django ====\n"
        "DJANGO_SETTINGS_MODULE=temple_proj.settings.settings\n"
        "SECRET_KEY=CHANGE_ME_TO_A_LONG_RANDOM_STRING_MIN_50_CHARS\n"
        "DEBUG=False\n"
        "ALLOWED_HOSTS=temple.example.com,www.temple.example.com,127.0.0.1,localhost\n"
        "CSRF_TRUSTED_ORIGINS=https://temple.example.com,https://www.temple.example.com\n\n"
        "# ==== MySQL (MariaDB) ====\n"
        "DB_NAME=temple\n"
        "DB_HOST=localhost\n"
        "DB_PORT=3306\n"
        "DB_USER=appadmin\n"
        "DB_PASSWORD=REPLACE_WITH_STRONG_PW\n\n"
        "# ==== Media / Static ====\n"
        "MEDIA_URL=/api/media/\n"
        "STATIC_URL=/static/\n\n"
        "# ==== Business rule ====\n"
        "PENALTY_PER_MONTH=25\n\n"
        "# ==== Optional: S3 for media (if used in production) ====\n"
        "# AWS_ACCESS_KEY_ID=...\n"
        "# AWS_SECRET_ACCESS_KEY=...\n"
        "# AWS_STORAGE_BUCKET_NAME=temple-media\n"
        "# AWS_S3_REGION_NAME=ap-south-1\n"
        "# AWS_S3_CUSTOM_DOMAIN=cdn.example.com\n\n"
        "# ==== Optional: Email / SMS ====\n"
        "# EMAIL_HOST=smtp.sendgrid.net\n"
        "# EMAIL_HOST_USER=apikey\n"
        "# EMAIL_HOST_PASSWORD=...\n"
        "# EMAIL_PORT=587\n"
        "# EMAIL_USE_TLS=True",
        s,
    ))

    story.append(h2("C.2  frontend/.env", s))
    story.append(p(
        "Save at <font face='Courier'>/opt/temple/app/frontend/.env</font> "
        "(on EC2) or <font face='Courier'>~/temple/frontend/.env</font> (local). "
        "Vite reads only <font face='Courier'>VITE_*</font> variables.",
        s,
    ))
    story.append(code(
        "# ==== Backend URL ====\n"
        "# Production (Nginx serves both frontend + /api on same domain):\n"
        "VITE_BACKEND_URL=https://temple.example.com\n\n"
        "# Local development (backend on port 8000):\n"
        "# VITE_BACKEND_URL=http://localhost:8000\n\n"
        "# ==== UI branding ====\n"
        "VITE_APP_NAME=Temple Management\n"
        "VITE_DEFAULT_LOCALE=en-IN\n"
        "VITE_CURRENCY=INR\n\n"
        "# ==== Optional feature flags ====\n"
        "VITE_ENABLE_WHATSAPP=true\n"
        "VITE_ENABLE_PRINT=true",
        s,
    ))
    story.append(note(
        "After changing <font face='Courier'>frontend/.env</font> you must run "
        "<font face='Courier'>yarn build</font> again (env variables are baked "
        "into the JS bundle at build time). After changing "
        "<font face='Courier'>backend/.env</font> run "
        "<font face='Courier'>sudo systemctl restart temple-backend</font>.",
        s,
    ))
    story.append(PageBreak())

    # ============  SECTION D — CHECKLIST  ============
    story.append(h1("D. Post-Install Checklist and Common Issues", s))

    story.append(h2("D.1 Smoke test", s))
    checklist = [
        "Site opens over HTTPS at your domain (padlock icon visible).",
        "Login works with the superuser you created.",
        "Home page renders with the sidebar; no overlap between sidebar and content.",
        "GET /api/user/admins_view/ returns 200 (not 500) with the JWT header.",
        "GET /api/penalty/summary/ returns rate_per_month: 25.0 and a total.",
        "Uploading a photo on a Member profile shows the file back in the Member List.",
        "sudo systemctl status temple-backend shows 'active (running)'.",
        "Nginx access log ( /var/log/nginx/access.log ) shows /api/* hitting 127.0.0.1:8000.",
    ]
    story.append(p(
        "".join(f"&nbsp;&nbsp;&#9634; {c}<br/>" for c in checklist),
        s,
    ))

    story.append(h2("D.2 Common issues", s))
    story.append(h3("502 Bad Gateway on /api/*", s))
    story.append(p(
        "Django is not running or crashed. Check "
        "<font face='Courier'>sudo journalctl -u temple-backend -n 100</font> "
        "and <font face='Courier'>/var/log/temple/backend.err.log</font>.",
        s,
    ))

    story.append(h3("Broken images on Member List", s))
    story.append(p(
        "The uploaded file is missing on disk. Verify "
        "<font face='Courier'>ls /opt/temple/app/backend/temple_proj/media/</font>. "
        "If empty, re-upload the media folder as in step B.9.",
        s,
    ))

    story.append(h3("Login returns 204 No Content", s))
    story.append(p(
        "Email or password is wrong. Reset from a Django shell:",
        s,
    ))
    story.append(code(
        "cd /opt/temple/app/backend && source venv/bin/activate\n"
        "python manage.py shell <<'PY'\n"
        "from user.models import User\n"
        "u = User.objects.get(email='admin@gmail.com')\n"
        "u.set_password('NewStrongPass123')\n"
        "u.is_superuser = True; u.is_staff = True\n"
        "u.save()\n"
        "PY",
        s,
    ))

    story.append(h3("CORS / CSRF errors after HTTPS", s))
    story.append(p(
        "Ensure <font face='Courier'>ALLOWED_HOSTS</font> and "
        "<font face='Courier'>CSRF_TRUSTED_ORIGINS</font> in "
        "<font face='Courier'>backend/.env</font> list the exact https URL, "
        "then restart the service.",
        s,
    ))

    story.append(h2("D.3 Regular maintenance", s))
    story.append(p(
        "&nbsp;&nbsp;&bull; <b>Daily DB backup</b>: schedule with cron:<br/>",
        s,
    ))
    story.append(code(
        "# /etc/cron.d/temple-backup\n"
        "0 2 * * * ubuntu mysqldump -u appadmin -p'STRONG_PW' temple | \\\n"
        "  gzip > /var/backups/temple/temple_$(date +\\%F).sql.gz",
        s,
    ))
    story.append(p(
        "&nbsp;&nbsp;&bull; <b>Log rotation</b>: <font face='Courier'>logrotate</font> "
        "is already installed. Add "
        "<font face='Courier'>/etc/logrotate.d/temple</font> to rotate "
        "<font face='Courier'>/var/log/temple/*.log</font> weekly.<br/>"
        "&nbsp;&nbsp;&bull; <b>Certificate renewal</b>: handled automatically by "
        "<font face='Courier'>certbot.timer</font>.<br/>"
        "&nbsp;&nbsp;&bull; <b>System updates</b>: "
        "<font face='Courier'>sudo unattended-upgrade -d</font> once a month.",
        s,
    ))

    story.append(Spacer(1, 0.5 * cm))
    story.append(p(
        "<i>End of guide. Keep this PDF next to the server for your ops team.</i>",
        s,
    ))

    doc.build(story)
    print(f"OK: wrote {out_path}")


if __name__ == "__main__":
    import sys
    build(sys.argv[1] if len(sys.argv) > 1 else "/app/Temple_Setup_Guide.pdf")
