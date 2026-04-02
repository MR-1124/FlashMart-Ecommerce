# FlashMart — Complete AWS Deployment Guide

> **Goal**: Deploy FlashMart on AWS with auto-scaling, load balancing, and monitoring.  
> **Approach**: Step-by-step using AWS Console + CLI. Follow in order.  
> **Cost**: Free tier eligible where possible. Estimated cost: **~$2-5/day** during testing.

> [!CAUTION]
> **Remember to shut down/delete resources when not testing.** An ALB alone costs ~$0.50/day, and multiple EC2 instances add up. After your demo, terminate everything to avoid surprise bills.

---

## Architecture Recap

```
                    ┌─────────────────────┐
                    │    CloudFront CDN    │  ← Serves React SPA
                    │    + S3 (frontend)   │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  Application Load   │  ← Routes API traffic
                    │  Balancer (ALB)      │     to healthy instances
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
        │  EC2 (A)   │  │  EC2 (B)   │  │  EC2 (N)   │  ← Auto Scaling
        │  Node.js   │  │  Node.js   │  │  Node.js   │     Group (2–6)
        └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
                    ┌─────────▼───────────┐
                    │    Amazon RDS        │  ← PostgreSQL (private)
                    │    PostgreSQL        │
                    └─────────────────────┘
```

---

## Phase A: AWS Account & Networking Setup

### A1. Sign into AWS Console

1. Go to [https://console.aws.amazon.com](https://console.aws.amazon.com)
2. Sign in (create a free tier account if you don't have one)
3. **Set your region** in the top-right corner → choose **`ap-south-1` (Mumbai)** (closest to India)

> [!TIP]
> Stick to ONE region for the entire project. If you switch regions accidentally, your resources will "disappear" (they're in the other region).

### A2. Create a VPC (Virtual Private Cloud)

The VPC is your isolated network inside AWS. Everything lives here.

1. Go to **VPC Console** → search "VPC" in the search bar
2. Click **"Create VPC"**
3. Choose **"VPC and more"** (this creates subnets automatically)
4. Settings:

| Field | Value |
|---|---|
| Name tag | `flashmart-vpc` |
| IPv4 CIDR | `10.0.0.0/16` |
| Number of Availability Zones | **2** (minimum for ALB) |
| Number of public subnets | **2** |
| Number of private subnets | **2** |
| NAT gateways | **None** (to save cost — we'll put everything in public subnets for a college project) |
| VPC endpoints | **None** |

5. Click **"Create VPC"**
6. Wait for it to complete. Note down:
   - **VPC ID**: `vpc-xxxxxxxx`
   - **Public Subnet 1**: `subnet-xxxxx` (AZ: ap-south-1a)
   - **Public Subnet 2**: `subnet-xxxxx` (AZ: ap-south-1b)

> [!NOTE]
> **Why 2 subnets in 2 AZs?** The ALB requires at least 2 Availability Zones. This also gives you high availability — if one data center goes down, the other keeps running.

### A3. Create Security Groups

Security groups are firewalls for your resources. We need 3:

#### Security Group 1: ALB Security Group

1. Go to **VPC Console** → **Security Groups** → **Create security group**
2. Settings:

| Field | Value |
|---|---|
| Name | `flashmart-sg-alb` |
| Description | Allow HTTP/HTTPS from internet |
| VPC | Select `flashmart-vpc` |

3. **Inbound Rules** — click "Add rule" twice:

| Type | Port | Source | Description |
|---|---|---|---|
| HTTP | 80 | `0.0.0.0/0` | Allow web traffic |
| HTTPS | 443 | `0.0.0.0/0` | Allow secure web traffic |

4. **Outbound Rules**: Leave default (allow all outbound)
5. Click **Create**. Note the **SG ID**: `sg-xxxxx`

#### Security Group 2: EC2 Security Group

1. Create another security group:

| Field | Value |
|---|---|
| Name | `flashmart-sg-ec2` |
| Description | Allow traffic from ALB and SSH |
| VPC | Select `flashmart-vpc` |

2. **Inbound Rules**:

| Type | Port | Source | Description |
|---|---|---|---|
| Custom TCP | 3000 | `flashmart-sg-alb` (select by SG) | App traffic from ALB only |
| SSH | 22 | `My IP` (auto-detects your IP) | SSH access for deployment |

3. Click **Create**. Note the **SG ID**: `sg-xxxxx`

#### Security Group 3: RDS Security Group

1. Create another security group:

| Field | Value |
|---|---|
| Name | `flashmart-sg-rds` |
| Description | Allow PostgreSQL from EC2 only |
| VPC | Select `flashmart-vpc` |

2. **Inbound Rules**:

| Type | Port | Source | Description |
|---|---|---|---|
| PostgreSQL | 5432 | `flashmart-sg-ec2` (select by SG) | DB access from EC2 only |

3. Click **Create**. Note the **SG ID**: `sg-xxxxx`

> [!IMPORTANT]
> **Why chain security groups like this?** Internet → ALB → EC2 → RDS. Each layer only accepts traffic from the layer above it. The database is NEVER exposed to the internet. This is a key security point for your viva.

### A4. Create an IAM Role for EC2

This role lets EC2 instances access S3 (for images) and push CloudWatch metrics.

1. Go to **IAM Console** → **Roles** → **Create role**
2. **Trusted entity type**: AWS service
3. **Use case**: EC2
4. Click **Next**
5. **Add permissions** — search and check these policies:
   - `AmazonS3FullAccess` (for image uploads)
   - `CloudWatchAgentServerPolicy` (for metrics)
   - `AmazonSSMManagedInstanceCore` (optional — for Session Manager SSH alternative)
6. Click **Next**
7. **Role name**: `flashmart-ec2-role`
8. Click **Create role**

### A5. Create an EC2 Key Pair

You need this to SSH into your EC2 instances.

1. Go to **EC2 Console** → **Key Pairs** → **Create key pair**
2. Settings:

| Field | Value |
|---|---|
| Name | `flashmart-key` |
| Key pair type | RSA |
| File format | `.pem` (for Mac/Linux) or `.ppk` (for PuTTY on Windows) |

3. Click **Create** — the `.pem` file downloads automatically
4. **Save this file safely!** You cannot download it again.

For Windows users with `.pem`:
```powershell
# Move to a safe location
Move-Item ~/Downloads/flashmart-key.pem ~/.ssh/flashmart-key.pem
```

---

## Phase B: RDS (PostgreSQL Database)

### B1. Create a Subnet Group

RDS needs a subnet group to know which subnets to use.

1. Go to **RDS Console** → **Subnet groups** → **Create DB subnet group**
2. Settings:

| Field | Value |
|---|---|
| Name | `flashmart-db-subnet` |
| Description | Subnets for FlashMart RDS |
| VPC | `flashmart-vpc` |

3. **Add subnets**: Select both public subnets (or private if you created them)
4. Click **Create**

### B2. Create the RDS Instance

1. Go to **RDS Console** → **Create database**
2. Settings:

| Field | Value |
|---|---|
| Method | Standard create |
| Engine | PostgreSQL |
| Engine version | PostgreSQL 15 (or latest) |
| Template | **Free tier** ✅ |
| DB instance identifier | `flashmart-db` |
| Master username | `flashmart_admin` |
| Master password | Choose a strong password → **WRITE IT DOWN** |
| DB instance class | `db.t3.micro` (free tier) |
| Storage type | General Purpose (gp2) |
| Allocated storage | 20 GB |
| Storage autoscaling | Disable (for cost control) |
| VPC | `flashmart-vpc` |
| Subnet group | `flashmart-db-subnet` |
| Public access | **No** (for security) |
| Security group | `flashmart-sg-rds` |
| Initial database name | `flashmart` |
| Backup retention | 1 day |
| Encryption | Disable (free tier) |
| Monitoring | Disable enhanced monitoring |

3. Click **Create database** — this takes **5-10 minutes**
4. Once available, go to the RDS instance and note the **Endpoint**:
   ```
   flashmart-db.xxxxxxxxxx.ap-south-1.rds.amazonaws.com
   ```

> [!WARNING]
> **"Public access: No"** means the database is only reachable from within the VPC (i.e., from EC2 instances). This is correct and secure. You CANNOT connect to it from your laptop. If you need to run migrations, you'll SSH into an EC2 instance first.

### B3. Test Database Connection (after EC2 is ready)

You'll do this after setting up EC2 in Phase D. Just remember:
```bash
# From inside an EC2 instance:
psql -h flashmart-db.xxxxxxxxxx.ap-south-1.rds.amazonaws.com -U flashmart_admin -d flashmart
```

---

## Phase C: S3 Bucket for Product Images

### C1. Create the Bucket

1. Go to **S3 Console** → **Create bucket**
2. Settings:

| Field | Value |
|---|---|
| Bucket name | `flashmart-images-<your-name>` (must be globally unique) |
| Region | `ap-south-1` |
| Object Ownership | ACLs disabled |
| Block Public Access | **Uncheck** "Block all public access" (we need images to be publicly readable) |
| Acknowledge the warning | ✅ Check the box |
| Versioning | Disable |
| Encryption | SSE-S3 (default) |

3. Click **Create bucket**

### C2. Add a Bucket Policy (public read for images)

1. Go to your bucket → **Permissions** tab → **Bucket policy** → Edit
2. Paste this policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

3. Click **Save changes**

### C3. Configure CORS (for frontend uploads)

1. Go to your bucket → **Permissions** tab → **CORS** → Edit
2. Paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

3. Click **Save changes**

> [!NOTE]
> In production, you'd restrict `AllowedOrigins` to your frontend domain. For a college project, `*` is fine.

---

## Phase D: EC2 Instance Setup

### D1. Launch the First EC2 Instance

This is a "golden" instance — you'll configure it, then create an AMI from it for the Auto Scaling Group.

1. Go to **EC2 Console** → **Launch instance**
2. Settings:

| Field | Value |
|---|---|
| Name | `flashmart-backend-base` |
| AMI | **Amazon Linux 2023** (free tier eligible) |
| Instance type | `t2.micro` (free tier) |
| Key pair | `flashmart-key` |
| Network | `flashmart-vpc` |
| Subnet | Any public subnet |
| Auto-assign public IP | **Enable** |
| Security group | `flashmart-sg-ec2` |
| IAM instance profile | `flashmart-ec2-role` |
| Storage | 8 GB gp3 (default) |

3. Under **Advanced details** → **User data** — paste this startup script:

```bash
#!/bin/bash
# Update system
dnf update -y

# Install Node.js 20
dnf install -y nodejs20 npm git

# Install PM2 globally (production process manager)
npm install -g pm2

# Create app directory
mkdir -p /home/ec2-user/flashmart
chown ec2-user:ec2-user /home/ec2-user/flashmart

echo "Setup complete!"
```

4. Click **Launch instance**
5. Wait for the instance to be **Running** and pass **2/2 status checks**

### D2. SSH into the EC2 Instance

```powershell
# Get the public IP from EC2 console
# On Windows (PowerShell):
ssh -i ~/.ssh/flashmart-key.pem ec2-user@<PUBLIC-IP>
```

If you get a permission error on the key file:
```powershell
# Windows: Fix key file permissions
icacls ~/.ssh/flashmart-key.pem /inheritance:r
icacls ~/.ssh/flashmart-key.pem /grant:r "$($env:USERNAME):(R)"
```

### D3. Deploy the Backend Code

Once SSH'd into the EC2 instance:

```bash
# Verify Node.js is installed
node --version    # Should show v20.x
npm --version

# If Node.js is not installed (user data didn't run):
sudo dnf install -y nodejs20 npm git
sudo npm install -g pm2

# Navigate to home
cd /home/ec2-user

# Option 1: Clone from Git (recommended)
git clone https://github.com/YOUR-USERNAME/flashmart.git
cd flashmart/server

# Option 2: Upload via SCP (if not using Git)
# Run from your LOCAL machine:
# scp -i ~/.ssh/flashmart-key.pem -r ./server ec2-user@<PUBLIC-IP>:/home/ec2-user/flashmart/
```

### D4. Install Dependencies and Configure

```bash
cd /home/ec2-user/flashmart/server

# Install production dependencies
npm install --production

# Create the .env file
nano .env
```

Paste this into the `.env` file (update the values):

```env
# Server
PORT=3000
NODE_ENV=production

# Database (RDS endpoint from Phase B)
DB_HOST=flashmart-db.xxxxxxxxxx.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=flashmart
DB_USER=flashmart_admin
DB_PASSWORD=YOUR_RDS_PASSWORD_FROM_PHASE_B

# JWT
JWT_SECRET=generate-a-real-random-secret-use-openssl-rand-hex-32
JWT_EXPIRES_IN=7d

# AWS S3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=flashmart-images-your-name

# Frontend URL (will be CloudFront URL later)
CLIENT_URL=*
```

> [!TIP]
> Generate a real JWT secret:
> ```bash
> openssl rand -hex 32
> ```
> Leave `AWS_ACCESS_KEY_ID` and `SECRET` empty — the EC2 IAM role handles S3 access automatically.

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### D5. Run Migrations and Seed the Database

```bash
# Run migrations
node src/db/migrate.js

# Seed demo data
node src/db/seed.js
```

You should see:
```
📋 Found 6 migration files
  ✅ 001_create_users.sql
  ✅ 002_create_categories.sql
  ✅ 003_create_products.sql
  ✅ 004_create_cart_items.sql
  ✅ 005_create_orders.sql
  ✅ 006_create_flash_sales.sql
✅ All migrations completed successfully!
```

### D6. Start with PM2 (Production Process Manager)

```bash
# Start the server with PM2
pm2 start server.js --name flashmart-api

# Verify it's running
pm2 status
pm2 logs flashmart-api --lines 20

# Test the health endpoint
curl http://localhost:3000/api/health
```

Expected health response:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "uptime": "5s",
  "hostname": "ip-10-0-1-xx",
  "database": "connected",
  "memory": { "used": "45 MB" }
}
```

### D7. Set PM2 to Auto-Start on Reboot

```bash
# Generate startup script
pm2 startup

# Copy/paste the command it outputs (starts with sudo)
# Then save the process list
pm2 save
```

> [!IMPORTANT]
> **Why PM2?** Unlike `node server.js`, PM2 restarts your app if it crashes, manages logs, and runs in the background. The ALB health check hits `/api/health` — if PM2 isn't keeping the app alive, the ALB will mark the instance as "unhealthy" and stop sending traffic to it.

---

## Phase E: Application Load Balancer (ALB)

### E1. Create a Target Group

The target group tells the ALB where to send traffic.

1. Go to **EC2 Console** → **Target Groups** → **Create target group**
2. Settings:

| Field | Value |
|---|---|
| Target type | Instances |
| Name | `flashmart-tg` |
| Protocol | HTTP |
| Port | 3000 |
| VPC | `flashmart-vpc` |
| Health check protocol | HTTP |
| Health check path | `/api/health` |
| Healthy threshold | 2 |
| Unhealthy threshold | 3 |
| Timeout | 5 seconds |
| Interval | 30 seconds |
| Success codes | 200 |

3. Click **Next**
4. **Register targets**: Select your `flashmart-backend-base` instance → click "Include as pending below"
5. Click **Create target group**

### E2. Create the ALB

1. Go to **EC2 Console** → **Load Balancers** → **Create load balancer**
2. Choose **Application Load Balancer**
3. Settings:

| Field | Value |
|---|---|
| Name | `flashmart-alb` |
| Scheme | Internet-facing |
| IP address type | IPv4 |
| VPC | `flashmart-vpc` |
| Mappings | Select BOTH Availability Zones + their public subnets |
| Security group | `flashmart-sg-alb` |
| Listener | HTTP : 80 |
| Default action | Forward to `flashmart-tg` |

4. Click **Create load balancer** — takes 2-3 minutes to provision

5. Once active, note the **DNS name**:
   ```
   flashmart-alb-1234567890.ap-south-1.elb.amazonaws.com
   ```

### E3. Test the ALB

```bash
# From your local machine
curl http://flashmart-alb-1234567890.ap-south-1.elb.amazonaws.com/api/health
```

You should get the same health JSON response. The `hostname` field will show which EC2 instance responded — this is how you'll prove load balancing works in your demo!

> [!NOTE]
> **Why an ALB and not directly hitting EC2?** 
> - The ALB distributes traffic across multiple instances
> - It performs health checks and stops sending traffic to unhealthy instances
> - It provides a single stable URL (EC2 IPs change on reboot)
> - It's required for the Auto Scaling Group to work

---

## Phase F: AMI + Launch Template + Auto Scaling Group

This is the **core autoscaling setup** — the most impressive part of your project.

### F1. Create an AMI from Your Configured Instance

An AMI is a "snapshot" of your instance. New instances launched by auto-scaling will be clones of this.

1. Go to **EC2 Console** → **Instances**
2. Select `flashmart-backend-base`
3. **Actions** → **Image and templates** → **Create image**
4. Settings:

| Field | Value |
|---|---|
| Image name | `flashmart-backend-ami-v1` |
| Description | FlashMart backend with Node.js, PM2, and app code |
| No reboot | ✅ Enable (keeps instance running) |

5. Click **Create image** — takes 3-5 minutes
6. Go to **AMIs** section and note the **AMI ID**: `ami-xxxxxxxxx`

### F2. Create a Launch Template

The launch template tells the ASG how to configure new instances.

1. Go to **EC2 Console** → **Launch Templates** → **Create launch template**
2. Settings:

| Field | Value |
|---|---|
| Name | `flashmart-lt` |
| AMI | `flashmart-backend-ami-v1` (your AMI from F1) |
| Instance type | `t2.micro` |
| Key pair | `flashmart-key` |
| Security group | `flashmart-sg-ec2` |
| IAM instance profile | `flashmart-ec2-role` |

3. Under **Advanced details** → **User data** (paste this):

```bash
#!/bin/bash
# Start the application on boot
cd /home/ec2-user/flashmart/server
sudo -u ec2-user pm2 start server.js --name flashmart-api
sudo -u ec2-user pm2 save
```

4. Click **Create launch template**

> [!IMPORTANT]
> **Why User data in the launch template?** When the ASG launches a new instance from the AMI, the code is already there (from the AMI snapshot). But PM2 needs to be told to start the app. The user data script runs on every boot and ensures the app is running.

### F3. Create the Auto Scaling Group

1. Go to **EC2 Console** → **Auto Scaling Groups** → **Create Auto Scaling group**
2. **Step 1 — Choose launch template:**

| Field | Value |
|---|---|
| Name | `flashmart-asg` |
| Launch template | `flashmart-lt` |
| Version | Latest |

3. **Step 2 — Choose instance launch options:**
   - VPC: `flashmart-vpc`
   - Availability Zones: Select **both** public subnets
   
4. **Step 3 — Configure advanced options:**
   - **Load balancing**: Attach to an existing load balancer
   - Choose **"Choose from your load balancer target groups"**
   - Select `flashmart-tg`
   - Health check type: **ELB** (uses the ALB health check)
   - Health check grace period: **120 seconds**

5. **Step 4 — Configure group size and scaling:**

| Field | Value |
|---|---|
| Desired capacity | **2** |
| Minimum capacity | **2** |
| Maximum capacity | **6** |

   **Scaling policies** → **Target tracking scaling policy**:

| Field | Value |
|---|---|
| Policy name | `flashmart-cpu-scaling` |
| Metric type | Average CPU utilization |
| Target value | **60** |
| Instance warmup | 120 seconds |

   ✅ Check **"Enable scale-in"**

   **Add another policy** (click "Add policy"):

| Field | Value |
|---|---|
| Policy name | `flashmart-request-scaling` |
| Metric type | ALBRequestCountPerTarget |
| Target group | `flashmart-tg` |
| Target value | **500** (requests per target per minute) |
| Instance warmup | 120 seconds |

6. **Step 5 — Add notifications:** Skip (or add an SNS topic for email alerts)
7. **Step 6 — Add tags:**

| Key | Value |
|---|---|
| Name | `flashmart-backend` |
| Project | `FlashMart` |

8. Click **Create Auto Scaling group**

The ASG will immediately launch 2 instances! Go to **EC2 → Instances** and you'll see them spinning up.

> [!NOTE]
> **What the scaling policies mean:**
> - **CPU policy**: If average CPU across all instances exceeds 60%, add instances. If it drops below ~42% (60 × 0.7), remove instances. The 0.7 multiplier is AWS's built-in hysteresis to prevent rapid scale-in/out.
> - **Request count policy**: If any instance is receiving more than 500 requests per minute, add instances to share the load.
> - **Minimum 2**: Even when idle, you always have 2 instances for high availability.
> - **Maximum 6**: Caps costs so a traffic spike doesn't launch 100 instances.

---

## Phase G: CloudWatch Alarms & Dashboard

### G1. Create CloudWatch Alarms

These alarms trigger notifications when scaling happens — essential for your demo.

#### Alarm 1: High CPU (for visibility)

1. Go to **CloudWatch Console** → **Alarms** → **Create alarm**
2. **Select metric** → EC2 → By Auto Scaling Group → `flashmart-asg` → `CPUUtilization`
3. Settings:

| Field | Value |
|---|---|
| Statistic | Average |
| Period | 1 minute |
| Threshold type | Static |
| Condition | Greater than 60 |
| Datapoints | 2 out of 3 |
| Alarm name | `flashmart-high-cpu` |

4. **Actions**: Add SNS notification (optional — create a topic and add your email)
5. Click **Create alarm**

#### Alarm 2: Low CPU (scale-in visibility)

Repeat with:
- Condition: **Less than 30**
- Alarm name: `flashmart-low-cpu`

### G2. Create a CloudWatch Dashboard

This is what you'll show during your demo — a live dashboard of your system.

1. Go to **CloudWatch Console** → **Dashboards** → **Create dashboard**
2. Name: `FlashMart-Dashboard`
3. Add these widgets (click "Add widget" → choose "Line" or "Number"):

**Widget 1: CPU Utilization (Line graph)**
- Metric: EC2 → By Auto Scaling Group → `flashmart-asg` → `CPUUtilization`
- Period: 1 minute

**Widget 2: Healthy Host Count (Number)**
- Metric: ApplicationELB → Per AppELB, per TG → `flashmart-alb` → `HealthyHostCount`
- Period: 1 minute

**Widget 3: Request Count (Line graph)**
- Metric: ApplicationELB → Per AppELB → `flashmart-alb` → `RequestCount`
- Period: 1 minute

**Widget 4: Response Time (Line graph)**
- Metric: ApplicationELB → Per AppELB → `flashmart-alb` → `TargetResponseTime`
- Period: 1 minute

**Widget 5: ASG Instance Count (Number)**
- Metric: Auto Scaling → Group Metrics → `flashmart-asg` → `GroupInServiceInstances`

4. Click **Save dashboard**

> [!TIP]
> **For your demo**: Open this dashboard before starting the load test. Set the time range to "1 hour" and auto-refresh to "10 seconds". The audience will see CPU spike → alarm fire → new instances appear → CPU normalize. This is the money shot.

---

## Phase H: Frontend Hosting (S3 + CloudFront)

### H1. Build the Frontend for Production

On your **local machine**:

```bash
cd client

# Create production .env
echo "VITE_API_URL=http://flashmart-alb-1234567890.ap-south-1.elb.amazonaws.com/api" > .env.production

# Build
npm run build
```

This creates a `dist/` folder with static HTML/CSS/JS files.

### H2. Create an S3 Bucket for Frontend

1. Go to **S3 Console** → **Create bucket**
2. Settings:

| Field | Value |
|---|---|
| Name | `flashmart-frontend-<your-name>` |
| Region | `ap-south-1` |
| Block Public Access | **Uncheck** all (need public read) |
| Acknowledge warning | ✅ |

3. Click **Create bucket**

### H3. Enable Static Website Hosting

1. Go to bucket → **Properties** tab → scroll to **Static website hosting** → Edit
2. Settings:

| Field | Value |
|---|---|
| Static website hosting | **Enable** |
| Index document | `index.html` |
| Error document | `index.html` (important for React Router!) |

3. Click **Save changes**

### H4. Add Bucket Policy

Go to **Permissions** → **Bucket policy** → paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::flashmart-frontend-your-name/*"
    }
  ]
}
```

### H5. Upload the Build

```powershell
# From your local machine (inside the client folder)
aws s3 sync dist/ s3://flashmart-frontend-your-name --delete
```

If you don't have the AWS CLI installed:
```powershell
# Install AWS CLI
winget install Amazon.AWSCLI

# Configure with your IAM credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (ap-south-1), Output (json)
```

### H6. Test the Frontend

Go to the S3 website URL (found in Properties → Static website hosting):
```
http://flashmart-frontend-your-name.s3-website.ap-south-1.amazonaws.com
```

> [!NOTE]
> **Optional: Add CloudFront** for HTTPS and caching. For a college demo, the S3 website URL works fine. If you want HTTPS:
> 1. Go to CloudFront → Create distribution
> 2. Origin domain: your S3 website endpoint
> 3. Default root object: `index.html`
> 4. Add a custom error response: 403 → `/index.html` → 200 (for React Router)

---

## Phase I: Load Testing (Proving Auto-Scaling)

This is how you PROVE autoscaling works to your professor.

### I1. Install Artillery (Load Testing Tool)

On your **local machine**:

```bash
npm install -g artillery
```

### I2. Create a Load Test Script

Create this file as `loadtest.yml` in your project root:

```yaml
config:
  target: "http://flashmart-alb-1234567890.ap-south-1.elb.amazonaws.com"
  phases:
    # Phase 1: Warm up (30 seconds, 10 users/sec)
    - duration: 30
      arrivalRate: 10
      name: "Warm Up"

    # Phase 2: Ramp up to simulate flash sale start (60 seconds)
    - duration: 60
      arrivalRate: 10
      rampTo: 100
      name: "Traffic Spike"

    # Phase 3: Peak load (120 seconds, 100 users/sec)  
    - duration: 120
      arrivalRate: 100
      name: "Flash Sale Peak"

    # Phase 4: Cool down (60 seconds)
    - duration: 60
      arrivalRate: 100
      rampTo: 5
      name: "Traffic Dying Down"

scenarios:
  - name: "Browse and shop"
    flow:
      # GET health check
      - get:
          url: "/api/health"

      # GET products list
      - get:
          url: "/api/products?page=1&limit=12"

      # GET single product
      - get:
          url: "/api/products/1"

      # GET active flash sale
      - get:
          url: "/api/flash-sales/active"

      # Pause to simulate real user behavior
      - think: 1
```

### I3. Run the Load Test

```bash
artillery run loadtest.yml
```

**While the test runs** (takes ~4.5 minutes), watch these in separate browser tabs:

1. **CloudWatch Dashboard** — CPU will spike → healthy hosts will increase
2. **EC2 Console → Instances** — new instances will appear with the tag `flashmart-backend`
3. **Auto Scaling Group → Activity** — shows scaling events with timestamps

### I4. What You Should See (Demo Scenario)

```
Timeline:
─────────────────────────────────────────────────────
0:00  Load test starts. 2 instances running. CPU ~5%
0:30  Ramp-up begins. CPU climbing to 40%...50%...60%
1:30  ⚠️ CloudWatch alarm: HIGH CPU triggered
1:30  🚀 ASG launches Instance #3
2:00  CPU drops to ~45% (spread across 3 instances)
2:00  🚀 ASG launches Instance #4 (still above target)
2:30  Instance #3 is healthy, receiving traffic
3:00  CPU stabilizes at ~35% across 4 instances
4:30  Load test ends. Traffic drops.
5:00  CPU drops to ~10%
8:00  ⬇️ ASG terminates Instance #4 (scale-in)
10:00 ⬇️ ASG terminates Instance #3
10:00 Back to 2 instances. Normal.
```

### I5. Collect Screenshots for Your Report

Take screenshots of:

| Screenshot | Why |
|---|---|
| CloudWatch Dashboard during high load | Shows CPU spike + healthy host count increasing |
| ASG Activity tab | Shows "Launching new EC2 instance" events with timestamps |
| EC2 Instances list (showing 4 instances) | Proves multiple instances were running |
| CloudWatch Dashboard after cooldown | Shows CPU normalizing + host count decreasing |
| ALB Target Group showing healthy targets | Proves load balancer is routing to all instances |
| Artillery test results | Shows request throughput and response times |

> [!TIP]
> **After the load test**, run `curl` multiple times against the ALB health endpoint and note the different `hostname` values — this proves requests are going to different servers.
> ```bash
> for i in {1..10}; do curl -s http://ALB-URL/api/health | grep hostname; done
> ```

---

## Phase J: Troubleshooting Guide

### Common Issues and Fixes

| Problem | Cause | Fix |
|---|---|---|
| **Can't SSH into EC2** | Security group doesn't have your IP | Update `flashmart-sg-ec2` inbound rule with your current IP |
| **EC2 can't reach RDS** | Wrong security group on RDS | Verify `flashmart-sg-rds` allows port 5432 from `flashmart-sg-ec2` |
| **ALB returns 502 Bad Gateway** | App isn't running on EC2 | SSH in and run `pm2 status`. If crashed, run `pm2 restart flashmart-api` |
| **ALB returns 503 error** | No healthy targets | Check Target Group → targets tab. If unhealthy, SSH in and check app logs with `pm2 logs` |
| **Health check fails** | App crashes on start | SSH in → `pm2 logs flashmart-api` → usually a missing env variable or bad DB connection |
| **New ASG instances are unhealthy** | User data script not running | Check instance system log: EC2 → Instance → Actions → Monitor → Get System Log |
| **CORS errors in browser** | Frontend URL not matching backend CORS | The app already allows any localhost in dev. For production, update `CLIENT_URL` in `.env` |
| **RDS connection timeout** | Wrong DB_HOST or security group | Verify the RDS endpoint and that SG allows 5432 from EC2's SG |
| **Autoscaling not triggering** | CPU not high enough / wrong metric | Use the Artillery load test. Check CloudWatch → ASG → Activity History |
| **Instances launch but stay unhealthy** | App doesn't start in time | Increase health check grace period to 180-300 seconds |
| **500 errors on API** | Check server logs | SSH in → `pm2 logs flashmart-api --err --lines 50` |

### Useful Debugging Commands (on EC2)

```bash
# Check if app is running
pm2 status
pm2 logs flashmart-api --lines 30

# Check if port 3000 is listening
ss -tlnp | grep 3000

# Check instance metadata (which instance am I?)
curl http://169.254.169.254/latest/meta-data/instance-id

# Check available memory
free -h

# Check disk usage
df -h

# Test database connection
node -e "const {Pool}=require('pg'); const p=new Pool({connectionString:process.env.DATABASE_URL}); p.query('SELECT 1').then(()=>console.log('DB OK')).catch(e=>console.error(e))"

# Restart the application
pm2 restart flashmart-api

# View PM2 resource monitoring
pm2 monit
```

### Updating Code on Running Instances

When you update your code:

```bash
# 1. SSH into any running instance
ssh -i ~/.ssh/flashmart-key.pem ec2-user@<IP>

# 2. Pull latest code
cd /home/ec2-user/flashmart/server
git pull origin main

# 3. Install any new dependencies
npm install --production

# 4. Restart
pm2 restart flashmart-api

# 5. Create a new AMI (for future auto-scaled instances)
# Do this from the AWS Console: Actions → Image → Create Image
```

---

## Cost Summary

| Resource | Cost | Free Tier? |
|---|---|---|
| EC2 `t2.micro` × 2 | ~$0.30/day each | 750 hrs/month free (1 instance) |
| RDS `db.t3.micro` | ~$0.50/day | 750 hrs/month free |
| ALB | ~$0.50/day | No free tier ⚠️ |
| S3 (frontend + images) | ~$0.01/day | 5 GB free |
| CloudWatch | Free | Basic monitoring free |
| Data transfer | ~$0.10/day | 1 GB/month free |
| **Total during testing** | **~$2-3/day** | |

> [!CAUTION]
> **After your demo, DELETE these resources to stop charges:**
> 1. Delete the Auto Scaling Group (terminates instances)
> 2. Delete the ALB
> 3. Delete the Target Group
> 4. Delete the RDS instance (skip final snapshot)
> 5. Empty and delete S3 buckets
> 6. Delete the AMI and associated snapshot
> 7. Delete the VPC (releases subnets, security groups, etc.)

---

## Deployment Checklist (Quick Reference)

```
□ VPC with 2 public subnets in 2 AZs
□ 3 Security Groups (ALB → EC2 → RDS chain)
□ IAM Role for EC2 (S3 + CloudWatch access)
□ RDS PostgreSQL (db.t3.micro, flashmart database)
□ S3 bucket for product images (public read)
□ EC2 instance with Node.js, PM2, app code, .env
□ Migrations and seed data run successfully
□ PM2 startup configured
□ AMI created from configured instance
□ Launch Template using the AMI
□ Target Group with health check on /api/health
□ Application Load Balancer (internet-facing)
□ Auto Scaling Group (min:2, max:6, target CPU:60%)
□ CloudWatch Dashboard with 5 key widgets
□ Frontend built and uploaded to S3
□ Artillery load test script ready
□ Load test run + screenshots captured
```
