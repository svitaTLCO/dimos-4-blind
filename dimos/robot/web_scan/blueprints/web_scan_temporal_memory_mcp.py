from dimos.agents.mcp.mcp_server import McpServer
from dimos.core.blueprints import autoconnect
from dimos.core.global_config import global_config
from dimos.perception.experimental.temporal_memory import TemporalMemoryConfig, temporal_memory, web_scan_input

web_scan_temporal_memory_mcp = autoconnect(
    web_scan_input(),
    temporal_memory(
        config=TemporalMemoryConfig(
            new_memory=global_config.new_memory,
            fps=1.0,
            window_s=5.0,
            stride_s=5.0,
            max_frames_per_window=3,
        )
    ),
    McpServer.blueprint(),
)
