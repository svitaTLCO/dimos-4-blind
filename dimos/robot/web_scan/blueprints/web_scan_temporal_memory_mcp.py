from dimos.agents.mcp.mcp_server import McpServer
from dimos.core.blueprints import autoconnect
from dimos.perception.experimental.temporal_memory import temporal_memory, web_scan_input

web_scan_temporal_memory_mcp = autoconnect(
    web_scan_input(),
    temporal_memory(),
    McpServer.blueprint(),
)
