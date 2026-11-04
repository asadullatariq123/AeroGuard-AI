# Supabase setup

1. Open the Supabase SQL Editor.
2. Run `schema.sql`.
3. Set `SUPABASE_URL` and `SUPABASE_KEY` in a local `.env` file.
4. Never commit `.env` or a Supabase secret key.

The ML integration uses `ml.supabase_data_service` to insert sensor readings and predictions and to read component history.
