FROM denoland/deno:1.24.0

USER deno

ADD . .
RUN deno cache index.ts

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "index.ts"]