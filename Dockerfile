FROM nikolaik/python-nodejs
EXPOSE 4000
RUN pip install torch==1.9.0+cpu torchvision==0.10.0+cpu torchaudio==0.9.0 -f https://download.pytorch.org/whl/torch_stable.html sklearn transformers sentence_transformers gspread oauth2client numpy git+https://github.com/adapter-hub/adapter-transformers.git@develop
RUN git clone -b backend https://github.com/Adapter-Hub/playground.git
WORKDIR "./playground"
RUN npm install
RUN npm run build
RUN apt update
RUN apt install default-mysql-server -y
RUN service mysql start; mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'password'; CREATE DATABASE ah_playground;"; npm run linux-typeorm-dev-sync
CMD service mysql start; npm run start-dev