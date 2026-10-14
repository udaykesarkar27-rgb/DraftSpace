package com.example.blog.repository;

import com.example.blog.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    /** Empty string for category / search means "no filter". */
    @EntityGraph(attributePaths = "author")
    @Query("""
            select p from Post p
            where (:category = '' or p.category = :category)
              and (:search = '' or lower(p.title) like lower(concat('%', :search, '%'))
                               or lower(p.content) like lower(concat('%', :search, '%')))
            """)
    Page<Post> search(@Param("category") String category,
                      @Param("search") String search,
                      Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Page<Post> findByAuthorId(Long authorId, Pageable pageable);

    @Query("select distinct p.category from Post p order by p.category")
    List<String> findDistinctCategories();

    @Query("select p.category, count(p) from Post p group by p.category order by count(p) desc")
    List<Object[]> countGroupedByCategory();
}
