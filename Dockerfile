FROM nikolaik/python-nodejs
RUN pip install torch==1.9.0+cpu torchvision==0.10.0+cpu torchaudio==0.9.0 -f https://download.pytorch.org/whl/torch_stable.html sklearn transformers
RUN git clone -b backend https://github.com/Adapter-Hub/playground.git
WORKDIR "./playground"
RUN npm install
RUN npm run build
RUN apt update
RUN apt install default-mysql-server -y
RUN service mysql start; mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'password'"; npm run linux-typeorm-dev-sync
EXPOSE 4000