package iuh.fit.goat.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "agora.rtc")
public class AgoraRtcProperties {
    private String appId = "";
    private String appCertificate = "";
    private int tokenTtlSeconds = 600;
    private String channelPrefix = "chatroom-";
}
