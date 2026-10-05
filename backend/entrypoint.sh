#!/bin/sh
set -e

flask seed

exec "$@"
