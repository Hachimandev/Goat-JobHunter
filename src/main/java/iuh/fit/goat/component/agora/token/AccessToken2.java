package iuh.fit.goat.component.agora.token;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;

class AccessToken2 {
    enum PrivilegeRtc {
        PRIVILEGE_JOIN_CHANNEL(1),
        PRIVILEGE_PUBLISH_AUDIO_STREAM(2),
        PRIVILEGE_PUBLISH_VIDEO_STREAM(3),
        PRIVILEGE_PUBLISH_DATA_STREAM(4);

        final short intValue;

        PrivilegeRtc(int value) {
            this.intValue = (short) value;
        }
    }

    enum PrivilegeRtm {
        PRIVILEGE_LOGIN(1);

        final short intValue;

        PrivilegeRtm(int value) {
            this.intValue = (short) value;
        }
    }

    private static final String VERSION = "007";
    static final short SERVICE_TYPE_RTC = 1;
    static final short SERVICE_TYPE_RTM = 2;

    private final String appCert;
    private final String appId;
    private final int expire;
    private final int issueTs;
    private final int salt;
    private final Map<Short, Service> services = new TreeMap<>();

    AccessToken2(String appId, String appCert, int expire) {
        this.appCert = appCert;
        this.appId = appId;
        this.expire = expire;
        this.issueTs = Utils.getTimestamp();
        this.salt = Utils.randomInt();
    }

    void addService(Service service) {
        this.services.put(service.getServiceType(), service);
    }

    String build() throws Exception {
        if (!Utils.isUUID(this.appId) || !Utils.isUUID(this.appCert)) {
            return "";
        }

        ByteBuf content = new ByteBuf()
                .put(this.appId)
                .put(this.issueTs)
                .put(this.expire)
                .put(this.salt)
                .put((short) this.services.size());

        byte[] signing = getSign();

        this.services.forEach((k, v) -> v.pack(content));

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(signing, "HmacSHA256"));
        byte[] signature = mac.doFinal(content.asBytes());

        ByteBuf packed = new ByteBuf();
        packed.put(signature);
        packed.buffer.put(content.asBytes());

        return getVersion() + Utils.base64Encode(Utils.compress(packed.asBytes()));
    }

    private byte[] getSign() throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(new ByteBuf().put(this.issueTs).asBytes(), "HmacSHA256"));
        byte[] signing = mac.doFinal(this.appCert.getBytes(StandardCharsets.UTF_8));

        mac.init(new SecretKeySpec(new ByteBuf().put(this.salt).asBytes(), "HmacSHA256"));
        return mac.doFinal(signing);
    }

    static String getUidStr(int uid) {
        if (uid == 0) {
            return "";
        }
        return String.valueOf(uid & 0xFFFFFFFFL);
    }

    static String getVersion() {
        return VERSION;
    }

    static class Service {
        short type;
        TreeMap<Short, Integer> privileges = new TreeMap<>();

        Service(short serviceType) {
            this.type = serviceType;
        }

        void addPrivilegeRtc(PrivilegeRtc privilege, int expire) {
            this.privileges.put(privilege.intValue, expire);
        }

        void addPrivilegeRtm(PrivilegeRtm privilege, int expire) {
            this.privileges.put(privilege.intValue, expire);
        }

        short getServiceType() {
            return this.type;
        }

        ByteBuf pack(ByteBuf buf) {
            return buf.put(this.type).putIntMap(this.privileges);
        }

        void unpack(ByteBuf byteBuf) {
            this.privileges = byteBuf.readIntMap();
        }
    }

    static class ServiceRtc extends Service {
        private String channelName;
        private String uid;

        ServiceRtc(String channelName, String uid) {
            super(SERVICE_TYPE_RTC);
            this.channelName = channelName;
            this.uid = uid;
        }

        @Override
        ByteBuf pack(ByteBuf buf) {
            return super.pack(buf).put(this.channelName).put(this.uid);
        }

        @Override
        void unpack(ByteBuf byteBuf) {
            super.unpack(byteBuf);
            this.channelName = byteBuf.readString();
            this.uid = byteBuf.readString();
        }
    }

    static class ServiceRtm extends Service {
        private String userId;

        ServiceRtm(String userId) {
            super(SERVICE_TYPE_RTM);
            this.userId = userId;
        }

        @Override
        ByteBuf pack(ByteBuf buf) {
            return super.pack(buf).put(this.userId);
        }

        @Override
        void unpack(ByteBuf byteBuf) {
            super.unpack(byteBuf);
            this.userId = byteBuf.readString();
        }
    }
}
