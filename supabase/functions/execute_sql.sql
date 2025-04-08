-- Create a function to execute SQL queries
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  affected_rows INTEGER;
  command_tag TEXT;
BEGIN
  -- Execute the query and capture the result
  EXECUTE sql_query;
  
  -- Get the command tag (INSERT, UPDATE, DELETE)
  GET DIAGNOSTICS command_tag = COMMAND_TAG;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Return a success message
  result := jsonb_build_object(
    'command', command_tag,
    'rowCount', affected_rows
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return the error message
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Create a function to execute SELECT queries
CREATE OR REPLACE FUNCTION execute_select_query(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Execute the query and return the result as JSON
  EXECUTE 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (' || sql_query || ') t' INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return the error message
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;
GRANT EXECUTE ON FUNCTION execute_select_query TO authenticated;
