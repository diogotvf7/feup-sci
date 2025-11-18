FROM --platform=linux/amd64 ubuntu:20.04

RUN apt-get update && apt-get install -y \
    zsh \ 
    python3 \
    libc6 \
    libssl1.1 \
    libsqlite3-0

WORKDIR /app

COPY ./app .

RUN chmod +x lib/Simulator

RUN ./bin/runsimulator.sh || true

EXPOSE 9000 12345

CMD ["lib/Simulator"]
