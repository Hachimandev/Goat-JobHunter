package iuh.fit.goat.util;

import org.hibernate.proxy.HibernateProxy;
import org.hibernate.proxy.LazyInitializer;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class EntityUtilTest {

    @Test
    void unproxy_shouldReturnImplementation_whenEntityIsHibernateProxy() {
        Object entity = new Object();
        HibernateProxy proxy = mock(HibernateProxy.class);
        LazyInitializer lazyInitializer = mock(LazyInitializer.class);

        when(proxy.getHibernateLazyInitializer()).thenReturn(lazyInitializer);
        when(lazyInitializer.getImplementation()).thenReturn(entity);

        assertSame(entity, EntityUtil.unproxy(proxy));
    }

    @Test
    void unproxy_shouldReturnSameEntity_whenEntityIsNotProxy() {
        Object entity = new Object();

        assertSame(entity, EntityUtil.unproxy(entity));
    }
}
