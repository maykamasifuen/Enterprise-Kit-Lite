package com.enterprise.starter.kit.modules.catalog.service;

import com.enterprise.starter.kit.modules.catalog.dto.CatalogItemRequest;
import com.enterprise.starter.kit.modules.catalog.dto.CatalogItemResponse;
import com.enterprise.starter.kit.modules.catalog.entity.CatalogItem;
import com.enterprise.starter.kit.modules.catalog.repository.CatalogItemRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CatalogService Unit Tests")
class CatalogServiceTest {

    @Mock private CatalogItemRepository repository;
    @InjectMocks private CatalogService service;

    private CatalogItem sampleItem() {
        CatalogItem item = new CatalogItem();
        item.setName("Web Dev");
        item.setDescription("Web development services");
        item.setUnitPrice(new BigDecimal("150.00"));
        item.setUnit("HOUR");
        item.setIsActive(true);
        return item;
    }

    @Test
    @DisplayName("getAll() returns all catalog items")
    void getAll_returnsAllItems() {
        CatalogItem item = sampleItem();
        when(repository.findAll()).thenReturn(List.of(item));

        List<CatalogItemResponse> result = service.getAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Web Dev");
        assertThat(result.get(0).unitPrice()).isEqualByComparingTo("150.00");
    }

    @Test
    @DisplayName("getActive() returns only active items")
    void getActive_returnsOnlyActive() {
        CatalogItem item = sampleItem();
        when(repository.findByIsActiveTrue()).thenReturn(List.of(item));

        List<CatalogItemResponse> result = service.getActive();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isActive()).isTrue();
    }

    @Test
    @DisplayName("getById() returns item when found")
    void getById_returnsItem() {
        CatalogItem item = sampleItem();
        when(repository.findById(1L)).thenReturn(Optional.of(item));

        CatalogItemResponse result = service.getById(1L);

        assertThat(result.name()).isEqualTo("Web Dev");
    }

    @Test
    @DisplayName("getById() throws when not found")
    void getById_throwsWhenNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");
    }

    @Test
    @DisplayName("create() persists and returns new catalog item")
    void create_persistsItem() {
        CatalogItemRequest req = new CatalogItemRequest(
                "Design", "UI/UX design", new BigDecimal("120.00"), "HOUR", true);
        CatalogItem saved = new CatalogItem();
        saved.setName("Design");
        saved.setUnitPrice(new BigDecimal("120.00"));
        saved.setIsActive(true);
        when(repository.save(any(CatalogItem.class))).thenReturn(saved);

        CatalogItemResponse result = service.create(req);

        assertThat(result.name()).isEqualTo("Design");
        assertThat(result.unitPrice()).isEqualByComparingTo("120.00");
        verify(repository).save(any(CatalogItem.class));
    }

    @Test
    @DisplayName("update() modifies existing item")
    void update_modifiesItem() {
        CatalogItem existing = sampleItem();
        CatalogItemRequest req = new CatalogItemRequest(
                "Updated", "Updated desc", new BigDecimal("200.00"), "DAY", true);
        CatalogItem updated = new CatalogItem();
        updated.setName("Updated");
        updated.setUnitPrice(new BigDecimal("200.00"));
        updated.setIsActive(true);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(CatalogItem.class))).thenReturn(updated);

        CatalogItemResponse result = service.update(1L, req);

        assertThat(result.name()).isEqualTo("Updated");
        assertThat(result.unitPrice()).isEqualByComparingTo("200.00");
    }

    @Test
    @DisplayName("delete() removes item when exists")
    void delete_removesItem() {
        when(repository.existsById(1L)).thenReturn(true);

        service.delete(1L);

        verify(repository).deleteById(1L);
    }

    @Test
    @DisplayName("delete() throws when not found")
    void delete_throwsWhenNotFound() {
        when(repository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.delete(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");
    }
}

